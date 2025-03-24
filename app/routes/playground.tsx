import React, { useState, useEffect } from 'react'
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

// Define types
interface ComponentData {
  name: string
  html: string
}

interface ExtractionData {
  components: ComponentData[]
}

interface CustomStyles {
  backgroundColor: string
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
    color: '#000000',
    padding: '0px',
    borderRadius: '0px',
  })
  const [copiedCustom, setCopiedCustom] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Load extraction data and selected component from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedData = localStorage.getItem('extractionData')
        const savedComponent = localStorage.getItem('selectedComponent')

        if (savedData) {
          const parsedData = JSON.parse(savedData)
          if (parsedData?.components?.length > 0) {
            setExtractionData(parsedData)
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
        console.error('Error loading from localStorage:', error)
        navigate('/')
      } finally {
        setIsLoading(false)
      }
    }
  }, [navigate])

  // Save selected component to localStorage
  const handleSelectComponent = (value: string) => {
    setSelectedComponent(value)
    localStorage.setItem('selectedComponent', value)
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

  if (isLoading) {
    return (
      <div className='container mx-auto p-6 flex justify-center items-center h-screen'>
        <div className='text-center'>
          <p>Loading component data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className='container mx-auto p-6'>
      <Card className='max-w-6xl mx-auto'>
        <CardHeader className='flex flex-row items-center justify-between'>
          <CardTitle>Asset Playground</CardTitle>
          <Link to='/'>
            <Button variant='outline' size='sm'>
              <ArrowLeft className='mr-2 h-4 w-4' />
              Back to Extract
            </Button>
          </Link>
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
                      <div className='border rounded p-4 bg-white'>
                        <div
                          dangerouslySetInnerHTML={{
                            __html: generateCustomizedHTML(
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
                            .html,
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
