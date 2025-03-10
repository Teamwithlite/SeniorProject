import React, { useState, useEffect, useMemo, useCallback, memo } from 'react'
import type { ActionFunction, LoaderFunction } from '@remix-run/node'
import { json } from '@remix-run/node'
import { Form, useFetcher } from '@remix-run/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Code, Copy, Check, Eye, PlayCircle, Settings } from 'lucide-react'
import type { ActionData, LoaderData, ExtractedComponent } from '~/types'
import { extractWebsite } from '~/services/extractor'

// Using react-syntax-highlighter for code display
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { tomorrow } from 'react-syntax-highlighter/dist/cjs/styles/prism'

export const loader: LoaderFunction = async () => {
  return json<LoaderData>({
    initialMessage: 'Enter a URL to extract UI components',
  })
}

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData()
  const url = formData.get('url') as string

  if (!url) {
    return json<ActionData>({
      success: false,
      error: 'Please provide a valid URL',
    })
  }

  try {
    const extractedData = await extractWebsite(url)
    return json<ActionData>({
      success: true,
      components: extractedData.components,
    })
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'An unknown error occurred'
    return json<ActionData>({
      success: false,
      error: 'Failed to extract UI components: ' + errorMessage,
    })
  }
}

interface ComponentPreviewProps {
  component: {
    name: string
    type?: string
    cleanHtml?: string
    html: string
    screenshot?: string
    styles?: React.CSSProperties
  }
}

// Memoized component to prevent unnecessary re-renders
const ComponentPreview = memo(({ component }: ComponentPreviewProps) => {
  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState('preview')

  const copyToClipboard = useCallback(async () => {
    await navigator.clipboard.writeText(component.cleanHtml || component.html)
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

          <TabsContent value='preview' className='p-4'>
            {component.screenshot && (
              <div className='mb-4'>
                <img
                  src={component.screenshot}
                  alt={component.name}
                  className='border rounded max-w-xs'
                  loading='lazy'
                />
              </div>
            )}
            <div
              className='border rounded p-4 bg-white'
              style={component.styles || {}}
              dangerouslySetInnerHTML={previewHtml}
            />
          </TabsContent>

          {activeTab === 'code' && (
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
                {component.cleanHtml || component.html}
              </SyntaxHighlighter>
            </TabsContent>
          )}
        </Tabs>
      </CardContent>
    </Card>
  )
})

ComponentPreview.displayName = 'ComponentPreview'

// Memoized component to prevent unnecessary re-renders
const AssetPlayground = memo(
  ({ components = [] }: { components: ExtractedComponent[] }) => {
    const [selectedComponent, setSelectedComponent] = useState<string>(
      components[0]?.name || '',
    )
    const [customStyles, setCustomStyles] = useState({
      width: '100',
      padding: '16',
      backgroundColor: '#ffffff',
      borderRadius: '4',
    })
    const [modifiedHtml, setModifiedHtml] = useState('')
    const [showCode, setShowCode] = useState(false)

    // Find the selected component - memoized to prevent recalculation
    const component = useMemo(() => {
      return components.find((c) => c.name === selectedComponent)
    }, [components, selectedComponent])

    // Memoize the style object to avoid recreation on every render
    const computedStyles = useMemo(() => {
      return {
        width: `${customStyles.width}%`,
        padding: `${customStyles.padding}px`,
        backgroundColor: customStyles.backgroundColor,
        borderRadius: `${customStyles.borderRadius}px`,
      }
    }, [customStyles])

    const updateStyle = useCallback((property: string, value: string) => {
      setCustomStyles((prev) => {
        const newStyles = { ...prev, [property]: value }
        return newStyles
      })
    }, [])

    // Debounced HTML update to avoid too many DOM operations
    useEffect(() => {
      if (!component) return

      const updateHtmlTimeout = setTimeout(() => {
        const parser = new DOMParser()
        const doc = parser.parseFromString(
          component.cleanHtml || component.html,
          'text/html',
        )
        const element = doc.body.firstElementChild

        if (element) {
          element.style.width = `${customStyles.width}%`
          element.style.padding = `${customStyles.padding}px`
          element.style.backgroundColor = customStyles.backgroundColor
          element.style.borderRadius = `${customStyles.borderRadius}px`
          setModifiedHtml(element.outerHTML)
        }
      }, 50) // Small delay to batch multiple style changes

      return () => clearTimeout(updateHtmlTimeout)
    }, [component, customStyles])

    // Memoize HTML content to avoid re-parsing on every render
    const previewHtml = useMemo(() => {
      return {
        __html:
          modifiedHtml ||
          (component ? component.cleanHtml || component.html : ''),
      }
    }, [modifiedHtml, component])

    if (!components.length) {
      return null
    }

    return (
      <Card className='mt-8'>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <PlayCircle className='h-5 w-5' /> Asset Playground
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='mb-4'>
            <Select
              value={selectedComponent}
              onValueChange={setSelectedComponent}
            >
              <SelectTrigger>
                <SelectValue placeholder='Select a component' />
              </SelectTrigger>
              <SelectContent>
                {components.map((component) => (
                  <SelectItem key={component.name} value={component.name}>
                    {component.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className='grid grid-cols-1 lg:grid-cols-3 gap-4'>
            <div className='space-y-4'>
              <div className='flex items-center gap-2'>
                <Eye className='h-4 w-4' />
                <h3 className='text-lg font-semibold'>Preview</h3>
              </div>
              {component && (
                <div className='border rounded-lg p-4' style={computedStyles}>
                  <div dangerouslySetInnerHTML={previewHtml} />
                </div>
              )}
            </div>

            <div className='space-y-4'>
              <div className='flex items-center gap-2'>
                <Settings className='h-4 w-4' />
                <h3 className='text-lg font-semibold'>Settings</h3>
              </div>
              <div>
                <Label>Width (%)</Label>
                <Slider
                  value={[parseInt(customStyles.width)]}
                  onValueChange={([value]) =>
                    updateStyle('width', value.toString())
                  }
                  min={10}
                  max={100}
                  step={1}
                  className='mt-2'
                />
              </div>
              <div>
                <Label>Padding (px)</Label>
                <Slider
                  value={[parseInt(customStyles.padding)]}
                  onValueChange={([value]) =>
                    updateStyle('padding', value.toString())
                  }
                  min={0}
                  max={48}
                  step={2}
                  className='mt-2'
                />
              </div>
              <div>
                <Label>Border Radius (px)</Label>
                <Slider
                  value={[parseInt(customStyles.borderRadius)]}
                  onValueChange={([value]) =>
                    updateStyle('borderRadius', value.toString())
                  }
                  min={0}
                  max={24}
                  step={1}
                  className='mt-2'
                />
              </div>
              <div>
                <Label>Background Color</Label>
                <Input
                  type='color'
                  value={customStyles.backgroundColor}
                  onChange={(e) =>
                    updateStyle('backgroundColor', e.target.value)
                  }
                  className='h-10 px-3 mt-2'
                />
              </div>
            </div>
          </div>

          <div className='mt-4'>
            <Button onClick={() => setShowCode(!showCode)}>
              {showCode ? 'Hide Code' : 'Show Code'}
            </Button>
          </div>

          {showCode && (
            <div className='mt-4 space-y-4'>
              <div className='flex items-center gap-2'>
                <Code className='h-4 w-4' />
                <h3 className='text-lg font-semibold'>Code</h3>
              </div>
              <div className='h-[400px] overflow-auto rounded-lg border'>
                <SyntaxHighlighter
                  language='markup'
                  style={tomorrow}
                  customStyle={{ margin: 0, height: '100%' }}
                >
                  {modifiedHtml ||
                    (component ? component.cleanHtml || component.html : '')}
                </SyntaxHighlighter>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    )
  },
)

AssetPlayground.displayName = 'AssetPlayground'

export default function Index() {
  const [url, setUrl] = useState('')
  const fetcher = useFetcher<ActionData>()
  const actionData = fetcher.data

  const handleSubmit = useCallback(() => {
    if (!url) return
    const formData = new FormData()
    formData.append('url', url)
    fetcher.submit(formData, { method: 'post' })
  }, [url, fetcher])

  // Memoize components to avoid re-renders when other state changes
  const extractedComponents = useMemo(() => {
    return actionData?.success && actionData.components
      ? actionData.components
      : []
  }, [actionData?.success, actionData?.components])

  return (
    <div className='container mx-auto p-6'>
      <Card className='max-w-6xl mx-auto'>
        <CardHeader>
          <CardTitle>FrontendXplorer - Extract UI Components</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue='extract' className='space-y-6'>
            <TabsList>
              <TabsTrigger value='extract' className='flex items-center gap-2'>
                <Code className='h-4 w-4' /> Extract Components
              </TabsTrigger>
              <TabsTrigger
                value='playground'
                className='flex items-center gap-2'
              >
                <PlayCircle className='h-4 w-4' /> Asset Playground
              </TabsTrigger>
            </TabsList>

            <TabsContent value='extract'>
              <div className='space-y-4'>
                <div className='flex gap-2'>
                  <Input
                    type='url'
                    name='url'
                    placeholder='Enter a URL to extract UI components'
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className='flex-1'
                    required
                    onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                  />
                  <Button
                    type='button'
                    onClick={handleSubmit}
                    disabled={fetcher.state === 'submitting'}
                  >
                    {fetcher.state === 'submitting'
                      ? 'Extracting...'
                      : 'Extract Components'}
                  </Button>
                </div>
              </div>

              {fetcher.state === 'loading' && (
                <p className='mt-4 text-gray-500'>
                  Extracting UI components...
                </p>
              )}

              {extractedComponents.length > 0 && (
                <div className='mt-6 space-y-4'>
                  {extractedComponents.map((component, index) => (
                    <ComponentPreview
                      key={`${component.type || 'component'}-${index}`}
                      component={component}
                    />
                  ))}
                </div>
              )}

              {actionData?.success === false && (
                <Alert className='mt-4'>
                  <AlertDescription>{actionData.error}</AlertDescription>
                </Alert>
              )}
            </TabsContent>

            <TabsContent value='playground'>
              {extractedComponents.length > 0 ? (
                <AssetPlayground components={extractedComponents} />
              ) : (
                <Alert>
                  <AlertDescription>
                    Extract some components first to use the playground.
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
