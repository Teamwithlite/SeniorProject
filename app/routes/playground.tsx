import React, { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from '@remix-run/react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '~/components/ui/label'
import { Input } from '~/components/ui/input'
import { Slider } from '~/components/ui/slider'
import { Alert, AlertDescription } from '~/components/ui/alert'
import { Button } from '~/components/ui/button'
import { Copy, Check, ArrowLeft } from 'lucide-react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { tomorrow } from 'react-syntax-highlighter/dist/cjs/styles/prism'

// Import proper types
import type { ExtractedComponent, ComponentStyle } from '~/types'

interface ExtractionData {
  components: ExtractedComponent[]
}

interface CustomStyles {
  backgroundColor: string
  backgroundImage?: string
  backgroundSize?: string
  backgroundPosition?: string
  color: string
  padding: string
  borderRadius: string
}

export default function PlaygroundPage() {
  const navigate = useNavigate()
  const [extractionData, setExtractionData] = useState<ExtractionData | null>(
    null,
  )
  const [selectedComponent, setSelectedComponent] = useState<string | null>(
    null,
  )
  const [customStyles, setCustomStyles] = useState<CustomStyles>({
    backgroundColor: '#ffffff',
    backgroundImage: '',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    color: '#000000',
    padding: '0px',
    borderRadius: '0px',
  })
  const [copiedCustom, setCopiedCustom] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Extract background styles from a component - defined first so it can be used in hooks
  const extractBackgroundStyles = useCallback(
    (component: ExtractedComponent): Partial<CustomStyles> => {
      const styles: Partial<CustomStyles> = {}

      // Try multiple sources for background color
      if (
        component.styles?.backgroundColor &&
        component.styles.backgroundColor !== 'rgba(0, 0, 0, 0)' &&
        component.styles.backgroundColor !== 'transparent'
      ) {
        styles.backgroundColor = component.styles.backgroundColor
      } else if (component.metadata?.hasBackgroundImage) {
        // If it has a background image but no color, use a light color as fallback
        styles.backgroundColor = '#f5f5f5'
      } else {
        // Try to extract a color from parent website by inspecting the HTML
        const parentColorMatch = component.html.match(
          /background-color:\s*([^;'"]+)/i,
        )
        if (parentColorMatch && parentColorMatch[1]) {
          styles.backgroundColor = parentColorMatch[1]
        } else {
          // Derive a complementary background from text color if available
          if (component.styles?.color) {
            // If text is dark, use light background and vice versa
            const textColor = component.styles.color
            const isLightText = isLightColor(textColor)
            styles.backgroundColor = isLightText ? '#333333' : '#f8f8f8'
          } else {
            // Default light gray as fallback
            styles.backgroundColor = '#f5f5f5'
          }
        }
      }

      // Get background image from component styles or metadata
      if (
        component.styles?.backgroundImage &&
        component.styles.backgroundImage !== 'none'
      ) {
        styles.backgroundImage = component.styles.backgroundImage

        // Also get background size and position if available
        if (component.styles.backgroundSize) {
          styles.backgroundSize = component.styles.backgroundSize
        }
        if (component.styles.backgroundPosition) {
          styles.backgroundPosition = component.styles.backgroundPosition
        }
      } else if (component.metadata?.backgroundImageUrl) {
        styles.backgroundImage = `url('${component.metadata.backgroundImageUrl}')`
      } else {
        // Try to extract background image from HTML
        const bgImageMatch = component.html.match(
          /background-image:\s*url\(['"]?([^'")]+)['"]?\)/i,
        )
        if (bgImageMatch && bgImageMatch[1]) {
          styles.backgroundImage = `url('${bgImageMatch[1]}')`
          styles.backgroundSize = 'cover'
          styles.backgroundPosition = 'center'
        }
      }

      return styles
    },
    [],
  )

  // Load extraction data from localStorage or sessionStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        // Try to get full data from sessionStorage first (preferred if available)
        let savedData = sessionStorage.getItem('extractionDataFull')

        // Fall back to localStorage if not in sessionStorage
        if (!savedData) {
          savedData = localStorage.getItem('extractionData')
        }

        const savedComponent = localStorage.getItem('selectedComponent')

        if (savedData) {
          const parsedData = JSON.parse(savedData)
          if (parsedData?.components?.length > 0) {
            // If components have compressed HTML (only preview), try to get full data
            if (
              parsedData.components[0].html === '' &&
              sessionStorage.getItem('extractionDataFull')
            ) {
              // Get the full data with complete HTML
              const fullData = JSON.parse(
                sessionStorage.getItem('extractionDataFull')!,
              )
              setExtractionData(fullData)
            } else {
              setExtractionData(parsedData)
            }

            if (savedComponent) {
              setSelectedComponent(savedComponent)
            }
          } else {
            navigate('/')
          }
        } else {
          navigate('/')
        }
      } catch (error) {
        console.error('Error loading from storage:', error)
        navigate('/')
      } finally {
        setIsLoading(false)
      }
    }
  }, [navigate])

  // Helper function to determine if a color is light or dark
  const isLightColor = (color: string): boolean => {
    let r, g, b

    // Handle hex colors
    if (color.startsWith('#')) {
      // Expand shorthand hex (#fff -> #ffffff)
      const hex =
        color.length === 4
          ? `#${color[1]}${color[1]}${color[2]}${color[2]}${color[3]}${color[3]}`
          : color

      r = parseInt(hex.slice(1, 3), 16)
      g = parseInt(hex.slice(3, 5), 16)
      b = parseInt(hex.slice(5, 7), 16)
    }
    // Handle rgb/rgba
    else if (color.startsWith('rgb')) {
      const parts = color.match(/[\d.]+/g)
      if (parts && parts.length >= 3) {
        r = parseInt(parts[0], 10)
        g = parseInt(parts[1], 10)
        b = parseInt(parts[2], 10)
      } else {
        return false // Default assumption
      }
    }
    // Can't parse, assume dark
    else {
      return false
    }

    // Calculate perceived brightness using the formula
    // (299*R + 587*G + 114*B) / 1000
    const brightness = (299 * r + 587 * g + 114 * b) / 1000
    return brightness > 128 // > 128 is light, <= 128 is dark
  }

  // Initialize background styles when component and extraction data are loaded
  useEffect(() => {
    if (extractionData?.components && selectedComponent) {
      const component = extractionData.components[parseInt(selectedComponent)]
      if (component) {
        const backgroundStyles = extractBackgroundStyles(component)
        setCustomStyles((prev) => ({
          ...prev,
          ...backgroundStyles,
        }))
      }
    }
  }, [extractionData, selectedComponent, extractBackgroundStyles])

  // Save selected component to localStorage and update styles
  const handleSelectComponent = (value: string) => {
    setSelectedComponent(value)
    localStorage.setItem('selectedComponent', value)

    // Update background styles based on the selected component
    if (extractionData?.components) {
      const component = extractionData.components[parseInt(value)]
      const backgroundStyles = extractBackgroundStyles(component)

      setCustomStyles((prev) => ({
        ...prev,
        ...backgroundStyles,
      }))
    }
  }

  // Function to copy customized code
  const copyCustomCode = () => {
    if (selectedComponent && extractionData) {
      const code = generateCustomizedHTML(
        extractionData.components[parseInt(selectedComponent)].html,
        customStyles,
      )

      navigator.clipboard
        .writeText(code)
        .then(() => {
          setCopiedCustom(true)
          setTimeout(() => setCopiedCustom(false), 2000)
        })
        .catch((err) => console.error('Failed to copy: ', err))
    }
  }

  // Function to generate HTML with custom styles
  const generateCustomizedHTML = (html: string, styles: CustomStyles) => {
    const styleString = Object.entries(styles)
      .filter(([_, value]) => value)
      .map(([key, value]) => `${key}: ${value};`)
      .join(' ')

    if (!styleString) return html

    // Find the first root element and apply styles to it
    const rootElementMatch = html.match(/<([a-zA-Z][a-zA-Z0-9]*)([^>]*)>/)
    if (rootElementMatch) {
      const [fullMatch, tagName, existingAttributes] = rootElementMatch
      const existingStyleMatch = existingAttributes.match(/style="([^"]*)"/)
      let newStyle = styleString

      if (existingStyleMatch) {
        // Combine existing styles with new styles
        newStyle = `${existingStyleMatch[1]}; ${styleString}`
        return html.replace(existingStyleMatch[0], `style="${newStyle}"`)
      } else {
        // Add style attribute
        return html.replace(
          fullMatch,
          `<${tagName} style="${newStyle}"${existingAttributes}>`,
        )
      }
    }

    // Fallback: wrap in div with styles
    return `<div style="${styleString}">${html}</div>`
  }

  // Function to reset storage and redirect to home
  const handleResetStorage = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('extractionData')
      localStorage.removeItem('selectedComponent')
      sessionStorage.removeItem('extractionDataFull')
      navigate('/')
    }
  }

  if (isLoading) {
    return (
      <div className='container mx-auto p-6 flex flex-col justify-center items-center h-screen gap-4'>
        <div className='w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin'></div>
        <div className='text-center'>
          <p className='text-lg font-medium'>Loading component data...</p>
          <p className='text-sm text-muted-foreground mt-2'>
            Please wait while we prepare your assets
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className='container mx-auto p-6'>
      <Card className='max-w-6xl mx-auto'>
        <CardHeader className='flex flex-row items-center justify-between'>
          <CardTitle>Asset Playground</CardTitle>
          <div className='flex gap-2'>
            <Button
              variant='destructive'
              size='sm'
              onClick={handleResetStorage}
            >
              Reset Data
            </Button>
            <Link to='/'>
              <Button variant='outline' size='sm'>
                <ArrowLeft className='mr-2 h-4 w-4' />
                Back to Extract
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {extractionData?.components?.length ? (
            <div className='grid grid-cols-1 gap-8'>
              <div className='flex flex-col space-y-4'>
                <h3 className='text-lg font-medium'>Select a Component</h3>
                <Select
                  onValueChange={handleSelectComponent}
                  value={selectedComponent || undefined}
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Choose a component to customize' />
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

              {selectedComponent !== null && (
                <div className='space-y-8'>
                  <Card>
                    <CardHeader>
                      <CardTitle>Component Preview</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div
                        className='border rounded p-4 component-preview'
                        style={{
                          backgroundColor:
                            customStyles.backgroundColor || '#f5f5f5',
                          backgroundImage:
                            customStyles.backgroundImage || 'none',
                          backgroundSize:
                            customStyles.backgroundSize || 'cover',
                          backgroundPosition:
                            customStyles.backgroundPosition || 'center',
                          // Add !important to ensure our styles aren't overridden
                          WebkitBackgroundSize:
                            customStyles.backgroundSize || 'cover',
                          MozBackgroundSize:
                            customStyles.backgroundSize || 'cover',
                        }}
                      >
                        <div
                          className='website-preview-wrapper'
                          style={{
                            // Apply component's original styling to better match the website
                            fontFamily:
                              extractionData.components[
                                parseInt(selectedComponent)
                              ].styles?.fontFamily,
                            fontSize:
                              extractionData.components[
                                parseInt(selectedComponent)
                              ].styles?.fontSize,
                            fontWeight:
                              extractionData.components[
                                parseInt(selectedComponent)
                              ].styles?.fontWeight,
                            lineHeight:
                              extractionData.components[
                                parseInt(selectedComponent)
                              ].styles?.lineHeight,
                            letterSpacing:
                              extractionData.components[
                                parseInt(selectedComponent)
                              ].styles?.letterSpacing,
                            ...(extractionData.components[
                              parseInt(selectedComponent)
                            ].styles?.textAlign && {
                              textAlign: extractionData.components[
                                parseInt(selectedComponent)
                              ].styles?.textAlign as any,
                            }),
                            ...(extractionData.components[
                              parseInt(selectedComponent)
                            ].styles?.flexDirection && {
                              flexDirection: extractionData.components[
                                parseInt(selectedComponent)
                              ].styles?.flexDirection as any,
                            }),
                            display:
                              extractionData.components[
                                parseInt(selectedComponent)
                              ].styles?.display,
                            alignItems:
                              extractionData.components[
                                parseInt(selectedComponent)
                              ].styles?.alignItems,
                            justifyContent:
                              extractionData.components[
                                parseInt(selectedComponent)
                              ].styles?.justifyContent,
                            gap: extractionData.components[
                              parseInt(selectedComponent)
                            ].styles?.gap,
                            boxShadow:
                              extractionData.components[
                                parseInt(selectedComponent)
                              ].styles?.boxShadow,
                            border:
                              extractionData.components[
                                parseInt(selectedComponent)
                              ].styles?.border,
                            margin:
                              extractionData.components[
                                parseInt(selectedComponent)
                              ].styles?.margin,
                            ...(extractionData.components[
                              parseInt(selectedComponent)
                            ].styles?.textTransform && {
                              textTransform: extractionData.components[
                                parseInt(selectedComponent)
                              ].styles?.textTransform as any,
                            }),
                            overflow: 'auto',
                          }}
                          dangerouslySetInnerHTML={{
                            __html: generateCustomizedHTML(
                              // Use cleanHtml if available, otherwise fall back to regular html
                              extractionData.components[
                                parseInt(selectedComponent)
                              ].cleanHtml ||
                                extractionData.components[
                                  parseInt(selectedComponent)
                                ].html,
                              customStyles,
                            ),
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
                      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                        {/* Color pickers */}
                        <div className='space-y-2'>
                          <Label htmlFor='bg-color'>Background Color</Label>
                          <Input
                            id='bg-color'
                            type='color'
                            value={customStyles.backgroundColor}
                            onChange={(e) =>
                              setCustomStyles({
                                ...customStyles,
                                backgroundColor: e.target.value,
                              })
                            }
                          />
                        </div>

                        {/* Background image toggle - only show if component has background image */}
                        {customStyles.backgroundImage && (
                          <div className='space-y-2'>
                            <Label htmlFor='bg-image-toggle'>
                              Background Image
                            </Label>
                            <Select
                              value={
                                customStyles.backgroundImage
                                  ? 'enabled'
                                  : 'disabled'
                              }
                              onValueChange={(value) => {
                                if (value === 'disabled') {
                                  // Disable background image
                                  setCustomStyles({
                                    ...customStyles,
                                    backgroundImage: '',
                                  })
                                } else if (
                                  extractionData &&
                                  selectedComponent
                                ) {
                                  // Re-enable background image from component
                                  const component =
                                    extractionData.components[
                                      parseInt(selectedComponent)
                                    ]
                                  const backgroundStyles =
                                    extractBackgroundStyles(component)

                                  setCustomStyles({
                                    ...customStyles,
                                    backgroundImage:
                                      backgroundStyles.backgroundImage || '',
                                    backgroundSize:
                                      backgroundStyles.backgroundSize ||
                                      'cover',
                                    backgroundPosition:
                                      backgroundStyles.backgroundPosition ||
                                      'center',
                                  })
                                }
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder='Toggle background image' />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value='enabled'>Enabled</SelectItem>
                                <SelectItem value='disabled'>
                                  Disabled
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        )}

                        <div className='space-y-2'>
                          <Label htmlFor='text-color'>Text Color</Label>
                          <Input
                            id='text-color'
                            type='color'
                            value={customStyles.color}
                            onChange={(e) =>
                              setCustomStyles({
                                ...customStyles,
                                color: e.target.value,
                              })
                            }
                          />
                        </div>

                        {/* Size controls */}
                        <div className='space-y-2'>
                          <Label>Padding</Label>
                          <Slider
                            min={0}
                            max={40}
                            step={1}
                            value={[
                              parseInt(
                                customStyles.padding.replace('px', ''),
                              ) || 0,
                            ]}
                            onValueChange={(value) =>
                              setCustomStyles({
                                ...customStyles,
                                padding: `${value[0]}px`,
                              })
                            }
                          />
                          <div className='text-sm text-muted-foreground'>
                            {customStyles.padding}
                          </div>
                        </div>

                        <div className='space-y-2'>
                          <Label>Border Radius</Label>
                          <Slider
                            min={0}
                            max={20}
                            step={1}
                            value={[
                              parseInt(
                                customStyles.borderRadius.replace('px', ''),
                              ) || 0,
                            ]}
                            onValueChange={(value) =>
                              setCustomStyles({
                                ...customStyles,
                                borderRadius: `${value[0]}px`,
                              })
                            }
                          />
                          <div className='text-sm text-muted-foreground'>
                            {customStyles.borderRadius}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Generated Code</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <SyntaxHighlighter language='markup' style={tomorrow}>
                        {generateCustomizedHTML(
                          extractionData.components[parseInt(selectedComponent)]
                            .cleanHtml ||
                            extractionData.components[
                              parseInt(selectedComponent)
                            ].html,
                          customStyles,
                        )}
                      </SyntaxHighlighter>
                      <Button onClick={copyCustomCode} className='mt-4'>
                        {copiedCustom ? (
                          <Check className='mr-2 h-4 w-4' />
                        ) : (
                          <Copy className='mr-2 h-4 w-4' />
                        )}
                        {copiedCustom ? 'Copied!' : 'Copy Code'}
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          ) : (
            <Alert>
              <AlertDescription>
                No components found. Please extract components first.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
