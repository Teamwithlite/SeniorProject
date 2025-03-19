// app/routes/_index.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react'
import type { LoaderFunction } from '@remix-run/node'
import { json } from '@remix-run/node'
import { useFetcher } from '@remix-run/react'

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
} from 'lucide-react'

// For code highlighting - make sure these are installed
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { tomorrow } from 'react-syntax-highlighter/dist/cjs/styles/prism'

// Import your types
import type { ActionData, LoaderData, ExtractedComponent } from '~/types'

// Remix loader
export const loader: LoaderFunction = async () => {
  return json<LoaderData>({
    initialMessage: 'Enter a URL to extract UI components',
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
  }, [component.cleanHtml, component.html])

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
          <TabsContent value="preview" className="p-4">
            {/* Scale controls */}
            <div className="relative mb-2 flex items-center justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setScale((prev) => Math.max(0.5, prev - 0.1))}
                disabled={scale <= 0.5}
              >
                <Minus className="h-3 w-3" />
              </Button>
              <span className="text-xs text-muted-foreground">
                {Math.round(scale * 100)}%
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setScale((prev) => Math.min(1, prev + 0.1))}
                disabled={scale >= 1}
              >
                <Plus className="h-3 w-3" />
              </Button>
              <Button variant="outline" size="sm" onClick={adjustScale}>
                <Maximize2 className="h-3 w-3" />
              </Button>
            </div>

            {/* The container for the scaled preview */}
            <div
              ref={previewRef}
              className="border rounded p-4 bg-white overflow-auto preview-wrapper"
      style={{ minHeight: '150px' }}
            >
              <div
                className="component-preview-container"
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
          backgroundColor: component.styles?.backgroundColor || 'inherit',
          color: component.styles?.color || 'inherit',
          fontSize: component.styles?.fontSize || 'inherit',
          fontFamily: component.styles?.fontFamily || 'inherit',
          fontWeight: component.styles?.fontWeight || 'inherit',
          lineHeight: component.styles?.lineHeight || 'inherit',
          margin: '0',
          padding: '0',
        }}
      >
        <div
          dangerouslySetInnerHTML={{
            __html: component.html,
                  }}
                />
              </div>
            </div>
          </TabsContent>

          {/* CODE TAB */}
          <TabsContent value="code" className="p-0">
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
export default function Index() {
  const [url, setUrl] = useState('')
  const [activeTab, setActiveTab] = useState('extract')
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])
  const [sessionId, setSessionId] = useState<string>('')
  const [page, setPage] = useState(1)
  const [componentsPerPage, setComponentsPerPage] = useState(10)
  const [isPolling, setIsPolling] = useState(false)
  const [manualDebug, setManualDebug] = useState<string>('') // For debugging
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null)
  const [customStyles, setCustomStyles] = useState<{
    backgroundColor: string,
    color: string,
    padding: string,
    borderRadius: string
  }>({
    backgroundColor: '',
    color: '',
    padding: '',
    borderRadius: ''
  })
  const [copiedCustom, setCopiedCustom] = useState(false)
  const pollingRef = useRef<NodeJS.Timeout | null>(null)
  const extractionStartTime = useRef<number | null>(null)

  // Remix fetcher
  const fetcher = useFetcher<ActionData>()
  const extractionData = fetcher.data

  // Function to generate customized HTML with styles
  const generateCustomizedHTML = (originalHTML: string, styles: Record<string, string>) => {
      // For simple implementation, just wrap in a div with styles
      const styleString = Object.entries(styles)
        .filter(([_, value]) => value)
        .map(([key, value]) => `${key}: ${value};`)
        .join(' ');
        
      if (!styleString) return originalHTML;
      
      // Return with style attribute added
      return originalHTML.replace(/<([a-z][a-z0-9]*)\s/i, `<$1 style="${styleString}" `);
    }
    
    // Function to copy customized code
    const copyCustomCode = () => {
      if (!selectedComponent) return;
      
      const customCode = generateCustomizedHTML(
        extractionData?.components?.[parseInt(selectedComponent)]?.html || '',
        customStyles
      );
      
      navigator.clipboard.writeText(customCode);
      setCopiedCustom(true);
      setTimeout(() => setCopiedCustom(false), 2000);
    }
  // Debug logs - very important for troubleshooting
  useEffect(() => {
    console.log('Fetcher state:', fetcher.state)
    console.log('Extraction data:', extractionData)
    
    // Add manual debug info
    setManualDebug(prev => 
      prev + `\n[${new Date().toISOString()}] Fetcher state: ${fetcher.state}, ` + 
      `Has data: ${!!extractionData}, ` +
      `Status: ${extractionData?.status || 'none'}, ` +
      `Components: ${extractionData?.components?.length || 0}`
    )
  }, [fetcher.state, extractionData])

  // Toggle component type selection
  const toggleComponentType = (type: string) => {
    if (selectedTypes.includes(type)) {
      setSelectedTypes(selectedTypes.filter((t) => t !== type))
    } else {
      setSelectedTypes([...selectedTypes, type])
    }
  }

  // Start extraction - this is the handler for the Extract button
  const startExtraction = () => {
    if (!url) return
    
    // Reset state for a fresh extraction
    setSessionId('')
    setManualDebug('')
    extractionStartTime.current = Date.now()
    
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
      setManualDebug(prev => prev + `\n[${new Date().toISOString()}] No session ID to check status`)
      return
    }
    
    setManualDebug(prev => prev + `\n[${new Date().toISOString()}] Manually checking status for ${sessionId}`)
    
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
    
    setManualDebug(prev => prev + `\n[${new Date().toISOString()}] Polling with sessionId: ${sessionId}`)
    
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
      setManualDebug(prev => prev + `\n[${new Date().toISOString()}] Setting session ID: ${extractionData.sessionId}`)
      setSessionId(extractionData.sessionId)
    }

    // If the extraction is in progress, start polling
    if (
      extractionData?.status === 'pending' ||
      extractionData?.status === 'processing'
    ) {
      if (!isPolling) {
        setManualDebug(prev => prev + `\n[${new Date().toISOString()}] Starting polling for status: ${extractionData?.status}`)
        setIsPolling(true)
        // Poll every 2 seconds
        pollingRef.current = setInterval(pollForUpdates, 2000)
      }
    } else if (isPolling) {
      // Extraction is done or error, stop polling
      setManualDebug(prev => prev + `\n[${new Date().toISOString()}] Stopping polling, status: ${extractionData?.status}`)
      setIsPolling(false)
      if (pollingRef.current) {
        clearInterval(pollingRef.current)
        pollingRef.current = null
      }
    }

    // Add a timeout safety valve - if extraction takes too long, stop polling
    if (extractionStartTime.current && Date.now() - extractionStartTime.current > 120000) {
      setManualDebug(prev => prev + `\n[${new Date().toISOString()}] Extraction timeout after 2 minutes`)
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

  // Pagination handlers
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

  // Calculate elapsed time since extraction started
  const elapsedTime = extractionStartTime.current 
    ? Math.floor((Date.now() - extractionStartTime.current) / 1000)
    : 0

  return (
    <div className='container mx-auto p-6'>
      <Card className='max-w-6xl mx-auto'>
        <CardHeader>
          <CardTitle>FrontendXplorer - Extract UI Components</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList>
              <TabsTrigger value='extract' className='flex items-center gap-2'>
                <Code className='h-4 w-4' /> Extract Components
              </TabsTrigger>
              <TabsTrigger
                value="playground"
                className="flex items-center gap-2"
                disabled={
                  !extractionData?.components || extractionData.components.length === 0
                }
              >
                <PlayCircle className="h-4 w-4" /> Asset Playground
              </TabsTrigger>
              <TabsTrigger value="debug" className="flex items-center gap-2">
                Debug
              </TabsTrigger>
            </TabsList>

            {/* EXTRACT TAB */}
            <TabsContent value="extract">
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-[1fr,auto] gap-2">
                    <Input
                      type="url"
                      placeholder="Enter a URL to extract UI components"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      disabled={isPolling}
                      className="flex-1"
                      required
                    />
                    <Button
                      onClick={startExtraction}
                      disabled={!url || isPolling}
                      className="whitespace-nowrap"
                    >
                      {isPolling ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Extracting...
                        </>
                      ) : extractionData?.status === 'completed' ? (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4" />
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
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2 mb-2"
                      onClick={() => {
                        // Toggle all vs none
                        if (selectedTypes.length > 0) {
                          setSelectedTypes([])
                        } else {
                          setSelectedTypes(COMPONENT_TYPES.map((t) => t.id))
                        }
                      }}
                    >
                      <Filter className="h-4 w-4" />
                      {selectedTypes.length > 0 ? 'Clear Filters' : 'Filter Component Types'}
                    </Button>

                    {selectedTypes.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                        {COMPONENT_TYPES.map((type) => (
                          <div key={type.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`filter-${type.id}`}
                              checked={selectedTypes.includes(type.id)}
                              onCheckedChange={() => toggleComponentType(type.id)}
                            />
                            <Label htmlFor={`filter-${type.id}`}>{type.label}</Label>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Extraction status */}
                {(isPolling || (extractionData?.status === 'pending' || extractionData?.status === 'processing')) && (
                  <div className="my-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span>
                        {extractionData?.message || 'Extracting components...'} 
                        {extractionStartTime.current ? ` (${elapsedTime}s elapsed)` : ''}
                      </span>
                      <span>{extractionData?.progress || 0}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-periwinkle h-2.5 rounded-full transition-all duration-300"
                        style={{ width: `${extractionData?.progress || 0}%` }}
                      ></div>
                    </div>
                    {elapsedTime > 30 && (
                      <div className="mt-2 text-xs text-red-500">
                        Extraction is taking longer than expected. You can try refreshing the page if it doesn't complete soon.
                      </div>
                    )}
                  </div>
                )}

                {/* Error display */}
                {extractionData?.error && (
                  <Alert className="mt-4">
                    <AlertDescription>{extractionData.error}</AlertDescription>
                  </Alert>
                )}

                {/* Manual check button when things seem stuck */}
                {isPolling && elapsedTime > 20 && (
                  <div className="mt-4">
                    <Button onClick={checkStatus} variant="outline" size="sm">
                      Check Status Manually
                    </Button>
                  </div>
                )}

                {/* Show extracted components */}
                {extractionData?.components && extractionData.components.length > 0 ? (
                  <div className="mt-4">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-medium">
                        Extracted Components ({extractionData.componentsFound || 0})
                      </h3>

                      {/* Pagination (top) */}
                      {extractionData.totalPages && extractionData.totalPages > 1 && (
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handlePrevPage}
                            disabled={page === 1}
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </Button>
                          <span className="text-sm">
                            Page {page} of {extractionData.totalPages}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleNextPage}
                            disabled={page === extractionData.totalPages}
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>

                    <div className="space-y-4">
                      {extractionData.components.map((component, index) => (
                        <ComponentPreview
                          key={`${component.type}-${index}`}
                          component={component}
                        />
                      ))}
                    </div>

                    {/* Pagination (bottom) */}
                    {extractionData.totalPages && extractionData.totalPages > 1 && (
                      <div className="flex justify-center mt-6">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handlePrevPage}
                            disabled={page === 1}
                          >
                            <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                          </Button>
                          <span className="mx-4 text-sm">
                            Page {page} of {extractionData.totalPages}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleNextPage}
                            disabled={page === extractionData.totalPages}
                          >
                            Next <ChevronRight className="h-4 w-4 ml-1" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : !isPolling && extractionData?.status !== 'pending' && extractionData?.status !== 'processing' ? (
                  <div className="py-8 text-center">
                    <p className="text-muted-foreground">
                      Enter a URL and click "Extract Components" to analyze a website.
                    </p>
                  </div>
                ) : null}
              </div>
            </TabsContent>

            {/* PLAYGROUND TAB */}
            <TabsContent value="playground">
              {extractionData?.components && extractionData.components.length > 0 ? (
                 <div className="mt-8">
                       <div className="grid grid-cols-1 gap-8">
                         <div className="flex flex-col space-y-4">
                           <h3 className="text-lg font-medium">Select a Component</h3>
                           <Select onValueChange={(value) => setSelectedComponent(value)}>
                             <SelectTrigger>
                               <SelectValue placeholder="Choose a component to customize" />
                             </SelectTrigger>
                             <SelectContent>
                               {extractionData.components.map((comp, index) => (
                                 <SelectItem key={index} value={index.toString()}>
                                   {comp.name}
                                 </SelectItem>
                               ))}
                             </SelectContent>
                           </Select>
                         </div>
                         
                         {selectedComponent && (
                           <div className="space-y-8">
                             <Card>
                               <CardHeader>
                                 <CardTitle>Component Preview</CardTitle>
                               </CardHeader>
                               <CardContent>
                                 <div className="border rounded p-4 bg-white">
                                   <div
                                     style={customStyles}
                                     dangerouslySetInnerHTML={{
                                       __html: extractionData.components[parseInt(selectedComponent)].html
                                     }}
                                   />
                                 </div>
                               </CardContent>
                            </Card>
                             
                             <Card>
                               <CardHeader>
                                 <CardTitle>Customize Styles</CardTitle>
                               </CardHeader>
                              <CardContent>
                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                   {/* Color pickers */}
                                   <div className="space-y-2">
                                     <Label htmlFor="bg-color">Background Color</Label>
                                     <Input
                                       id="bg-color"
                                       type="color"
                                       value={customStyles.backgroundColor || '#ffffff'}
                                       onChange={(e) => setCustomStyles({...customStyles, backgroundColor: e.target.value})}
                                     />
                                   </div>
                                   
                                   <div className="space-y-2">
                                     <Label htmlFor="text-color">Text Color</Label>
                                     <Input
                                       id="text-color"
                                       type="color"
                                      value={customStyles.color || '#000000'}
                                       onChange={(e) => setCustomStyles({...customStyles, color: e.target.value})}
                                     />
                                   </div>
                                   
                                   {/* Size controls */}
                                   <div className="space-y-2">
                                     <Label>Padding</Label>
                                     <Slider
                                       min={0}
                                       max={40}
                                       step={1}
                                       value={[parseInt(customStyles.padding) || 0]}
                                       onValueChange={(value) => setCustomStyles({...customStyles, padding: `${value[0]}px`})}
                                     />
                                   </div>
                                   
                                   <div className="space-y-2">
                                     <Label>Border Radius</Label>
                                     <Slider
                                       min={0}
                                       max={20}
                                       step={1}
                                       value={[parseInt(customStyles.borderRadius) || 0]}
                                      onValueChange={(value) => setCustomStyles({...customStyles, borderRadius: `${value[0]}px`})}
                                    />
                                   </div>
                                 </div>
                              </CardContent>
                             </Card>
                             
                             <Card>
                               <CardHeader>
                                 <CardTitle>Generated Code</CardTitle>
                               </CardHeader>
                               <CardContent>
                                 <SyntaxHighlighter
                                   language="markup"
                                   style={tomorrow}
                                 >
                                   {generateCustomizedHTML(extractionData.components[parseInt(selectedComponent)].html, customStyles)}
                                 </SyntaxHighlighter>
                                 <Button onClick={copyCustomCode} className="mt-4">
                                   {copiedCustom ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
                                   {copiedCustom ? 'Copied!' : 'Copy Code'}
                                 </Button>
                               </CardContent>
                             </Card>
                           </div>
                         )}
                      </div>
                     </div>
              ) : (
                <Alert>
                  <AlertDescription>
                    Extract some components first to use the playground.
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>

            {/* DEBUG TAB */}
            <TabsContent value="debug">
              <div className="mt-4">
                <h3 className="text-lg font-medium mb-2">Debug Information</h3>
                <div className="rounded bg-black text-white p-4 text-xs font-mono h-64 overflow-auto">
                  <div>Fetcher State: {fetcher.state}</div>
                  <div>Session ID: {sessionId || 'none'}</div>
                  <div>Is Polling: {isPolling ? 'yes' : 'no'}</div>
                  <div>Extraction Status: {extractionData?.status || 'none'}</div>
                  <div>Progress: {extractionData?.progress || 0}%</div>
                  <div>Components Found: {extractionData?.componentsFound || 0}</div>
                  <div>Components in Current Data: {extractionData?.components?.length || 0}</div>
                  <div>Elapsed Time: {elapsedTime}s</div>
                  <div className="mt-4 pt-4 border-t border-gray-700">Debug Log:</div>
                  <pre className="whitespace-pre-wrap">{manualDebug}</pre>
                </div>
                <div className="mt-4 flex gap-2">
                  <Button onClick={startExtraction} variant="outline" size="sm">
                    Restart Extraction
                  </Button>
                  <Button onClick={checkStatus} variant="outline" size="sm">
                    Check Status Manually
                  </Button>
                  <Button 
                    onClick={() => window.location.reload()} 
                    variant="outline" 
                    size="sm"
                  >
                    Refresh Page
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}