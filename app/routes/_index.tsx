import React, { useState } from 'react'
import type { ActionFunction, LoaderFunction } from '@remix-run/node'
import { json } from '@remix-run/node'
import { Form, useActionData, useLoaderData } from '@remix-run/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Code, Copy, Check } from 'lucide-react'
import * as cheerio from 'cheerio'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { materialDark } from 'react-syntax-highlighter/dist/cjs/styles/prism'

interface ExtractedButton {
  type: string
  variant: 'default' | 'secondary' | 'outline' | 'ghost'
  size: 'default' | 'sm' | 'lg'
  text: string
  code: string
  className?: string
}

interface ExtractedTemplate {
  name: string
  component: string
  code: string
}

interface ExtractedAssets {
  buttons: ExtractedButton[]
  templates: ExtractedTemplate[]
}

// Helper Functions
function extractButtonStyle(
  element: cheerio.Element,
  $: cheerio.CheerioAPI,
): 'default' | 'secondary' | 'outline' | 'ghost' {
  const classNames = $(element).attr('class') || ''
  const styles = classNames.split(' ')

  // Check for common button class patterns
  if (
    styles.some(
      (s) => s.match(/(btn|button)-primary/i) || s.match(/bg-(blue|primary)/),
    )
  ) {
    return 'default'
  }
  if (
    styles.some(
      (s) =>
        s.match(/(btn|button)-secondary/i) ||
        s.match(/bg-(gray|grey|secondary)/),
    )
  ) {
    return 'secondary'
  }
  if (
    styles.some(
      (s) =>
        s.match(/(btn|button)-outline/i) ||
        (s.match(/border/) && !s.match(/bg-/)),
    )
  ) {
    return 'outline'
  }
  if (
    styles.some(
      (s) =>
        s.match(/(btn|button)-ghost/i) || (s.match(/text-/) && !s.match(/bg-/)),
    )
  ) {
    return 'ghost'
  }

  // Default to primary if no specific style is found
  return 'default'
}

function extractButtonSize(
  element: cheerio.Element,
  $: cheerio.CheerioAPI,
): 'sm' | 'default' | 'lg' {
  const classNames = $(element).attr('class') || ''
  const styles = classNames.split(' ')

  // Check for common size patterns
  if (
    styles.some(
      (s) =>
        s.match(/(btn|button)-sm/i) || s.match(/text-sm/) || s.match(/p-[1-2]/),
    )
  ) {
    return 'sm'
  }
  if (
    styles.some(
      (s) =>
        s.match(/(btn|button)-lg/i) || s.match(/text-lg/) || s.match(/p-[4-6]/),
    )
  ) {
    return 'lg'
  }

  return 'default'
}

function cleanHTML(html: string): string {
  return html
    .replace(/(\r\n|\n|\r)/gm, '') // Remove newlines
    .replace(/\s+/g, ' ') // Remove extra spaces
    .trim()
}

function extractTemplate(
  element: cheerio.Element,
  $: cheerio.CheerioAPI,
): ExtractedTemplate | null {
  const $element = $(element)
  const html = $.html(element)

  // Skip small elements
  if (html.length < 50) return null

  // Skip if element is not significant
  if (!$element.find('h1, h2, h3, h4, p, img, button').length) return null

  const templateType = determineTemplateType(element, $)
  if (!templateType) return null

  return {
    name: templateType,
    component: cleanHTML(html),
    code: cleanHTML(html),
  }
}

function determineTemplateType(
  element: cheerio.Element,
  $: cheerio.CheerioAPI,
): string | null {
  const $element = $(element)
  const html = $.html(element)

  // Hero Section Detection
  if (
    $element.find('h1, h2').length > 0 &&
    $element.find('p').length > 0 &&
    $element.find('button, .btn, .button, a').length > 0 &&
    html.length > 200
  ) {
    return 'Hero Section'
  }

  // Feature Card Detection
  if (
    $element.find('h3, h4').length > 0 &&
    $element.find('p').length > 0 &&
    html.length > 100 &&
    html.length < 500
  ) {
    return 'Feature Card'
  }

  // Navigation Detection
  if (
    ($element.is('nav') || $element.find('nav').length > 0) &&
    $element.find('a').length > 2
  ) {
    return 'Navigation'
  }

  // Footer Detection
  if (
    $element.is('footer') ||
    ($element.find('a').length > 3 && html.toLowerCase().includes('copyright'))
  ) {
    return 'Footer'
  }

  return null
}

// Loader Function
export const loader: LoaderFunction = async () => {
  return json({
    initialMessage: 'Enter a URL to extract website assets',
  })
}

// Action Function
export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData()
  const url = formData.get('url') as string

  if (!url) {
    return json({
      success: false,
      error: 'Please provide a valid URL',
    })
  }

  try {
    // Validate URL
    new URL(url)

    const response = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch webpage: ${response.statusText}`)
    }

    const html = await response.text()
    const $ = cheerio.load(html)

    const assets: ExtractedAssets = {
      buttons: [],
      templates: [],
    }

    // Extract buttons
    $('button, .btn, .button, [class*="btn-"], [class*="button-"]').each(
      (_, element) => {
        const $el = $(element)
        const buttonHtml = $.html(element)
        const className = $el.attr('class')

        assets.buttons.push({
          type: 'Custom',
          variant: extractButtonStyle(element, $),
          size: extractButtonSize(element, $),
          text: $el.text().trim() || 'Button',
          code: cleanHTML(buttonHtml),
          className,
        })
      },
    )

    // Extract templates
    $('section, div, header').each((_, element) => {
      const template = extractTemplate(element, $)
      if (template) {
        assets.templates.push(template)
      }
    })

    // Remove duplicates and limit results
    assets.buttons = assets.buttons
      .filter(
        (button, index, self) =>
          index === self.findIndex((b) => b.code === button.code),
      )
      .slice(0, 6)

    assets.templates = assets.templates
      .filter(
        (template, index, self) =>
          index === self.findIndex((t) => t.code === template.code),
      )
      .slice(0, 4)

    return json({
      success: true,
      assets,
    })
  } catch (error) {
    return json({
      success: false,
      error:
        'Failed to extract assets from the provided URL: ' +
        (error as Error).message,
    })
  }
}

// AssetDisplay Component
function AssetDisplay({
  title,
  originalPreview,
  convertedPreview,
  code,
}: {
  title: string
  originalPreview: string
  convertedPreview: React.ReactNode
  code: string
}) {
  const [showCode, setShowCode] = useState(false)
  const [copied, setCopied] = useState(false)

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className='border rounded-lg p-4 space-y-4'>
      <div className='flex justify-between items-center'>
        <h3 className='font-medium'>{title}</h3>
        <div className='space-x-2'>
          <Button
            variant='outline'
            size='sm'
            onClick={() => setShowCode(!showCode)}
          >
            <Code className='w-4 h-4 mr-2' />
            {showCode ? 'Hide Code' : 'Show Code'}
          </Button>
          {showCode && (
            <Button variant='outline' size='sm' onClick={copyToClipboard}>
              {copied ? (
                <Check className='w-4 h-4 mr-2' />
              ) : (
                <Copy className='w-4 h-4 mr-2' />
              )}
              {copied ? 'Copied!' : 'Copy'}
            </Button>
          )}
        </div>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        <div>
          <div className='text-sm text-gray-500 mb-2'>Original</div>
          <div className='border rounded p-6 bg-white dark:bg-gray-800'>
            <div dangerouslySetInnerHTML={{ __html: originalPreview }} />
          </div>
        </div>
        <div>
          <div className='text-sm text-gray-500 mb-2'>
            Converted (shadcn/ui)
          </div>
          <div className='border rounded p-6 bg-white dark:bg-gray-800'>
            {convertedPreview}
          </div>
        </div>
      </div>

      {showCode && (
        <div className='w-full overflow-x-auto'>
          <SyntaxHighlighter
            language='html'
            style={materialDark}
            className='rounded min-w-[800px]'
            customStyle={{
              margin: 0,
              width: '100%',
              maxWidth: 'none',
            }}
          >
            {code}
          </SyntaxHighlighter>
        </div>
      )}
    </div>
  )
}
// Main Component
export default function Index() {
  const [url, setUrl] = useState('')
  const loaderData = useLoaderData<typeof loader>()
  const actionData = useActionData<typeof action>()

  return (
    <div className='container mx-auto p-6'>
      <Card className='max-w-6xl mx-auto'>
        <CardHeader>
          <CardTitle>FrontendXplorer</CardTitle>
        </CardHeader>
        <CardContent>
          <Form method='post' className='space-y-4'>
            <div className='flex gap-2'>
              <Input
                type='url'
                name='url'
                placeholder={loaderData.initialMessage}
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className='flex-1'
                required
              />
              <Button type='submit'>Extract Assets</Button>
            </div>
          </Form>

          {actionData?.success && actionData.assets && (
            <Tabs defaultValue='buttons' className='mt-6'>
              <TabsList>
                <TabsTrigger value='buttons'>
                  Buttons ({actionData.assets.buttons.length})
                </TabsTrigger>
                <TabsTrigger value='templates'>
                  Templates ({actionData.assets.templates.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value='buttons' className='space-y-4'>
                <div className='grid grid-cols-1 gap-4'>
                  {actionData.assets.buttons.map((button, index) => (
                    <AssetDisplay
                      key={index}
                      title={`${button.type} Button`}
                      originalPreview={button.code}
                      convertedPreview={
                        <Button
                          variant={button.variant}
                          size={button.size}
                          className='w-full'
                        >
                          {button.text}
                        </Button>
                      }
                      code={button.code}
                    />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value='templates' className='space-y-4'>
                {actionData.assets.templates.map((template, index) => (
                  <AssetDisplay
                    key={index}
                    title={template.name}
                    originalPreview={template.component}
                    convertedPreview={
                      <div className='w-full'>
                        <div
                          dangerouslySetInnerHTML={{
                            __html: template.component,
                          }}
                        />
                      </div>
                    }
                    code={template.code}
                  />
                ))}
              </TabsContent>
            </Tabs>
          )}

          {actionData?.success === false && (
            <Alert className='mt-4'>
              <AlertDescription>{actionData.error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
