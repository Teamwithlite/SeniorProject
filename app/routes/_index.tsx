// app/routes/_index.tsx
import React, { useState } from 'react';
import type { ActionFunction, LoaderFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Form, useFetcher } from '@remix-run/react';

// Import UI components
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '~/components/ui/card';
import { Alert, AlertDescription } from '~/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs';

// Import icons
import { Code, Copy, Check, Eye, EyeOff } from 'lucide-react';

// Import our types and utilities
import type { ExtractedComponent } from '~/types';
import { cn } from '~/lib/utils';

// Loader function provides initial state
export const loader: LoaderFunction = async () => {
  return json({
    initialMessage: 'Enter a URL to extract UI components',
  });
};

// Component to preview extracted components
function ComponentPreview({ component }: { component: ExtractedComponent }) {
  // Convert the extracted styles to Tailwind classes
  const tailwindClasses = component.metadata.styles.join(' ');
  
  // Handle different component types
  switch (component.type) {
    case 'button':
      return (
        <Button
          variant={component.metadata.variant}
          size={component.metadata.size}
          className={tailwindClasses}
        >
          {component.metadata.content}
        </Button>
      );
    case 'hero':
    case 'navigation':
      return (
        <div className="relative w-full min-h-[200px] border-2 border-dashed rounded-lg p-4">
          <div 
            className={cn("w-full h-full", tailwindClasses)}
            dangerouslySetInnerHTML={{ __html: component.html }} 
          />
        </div>
      );
    default:
      return (
        <div 
          className={cn("relative", tailwindClasses)}
          dangerouslySetInnerHTML={{ __html: component.html }} 
        />
      );
  }
}

// Component to display individual extracted components
function UIComponent({ component }: { component: ExtractedComponent }) {
  const [viewMode, setViewMode] = useState<'preview' | 'code'>('preview');
  const [copied, setCopied] = useState(false);

  return (
    <Card className="w-full overflow-hidden border-2">
      <CardHeader className="bg-gray-50 dark:bg-gray-800">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-medium">
              {component.name}
            </CardTitle>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <span className="capitalize">{component.type}</span>
              <span>•</span>
              <span>Accessibility: {component.metadata.accessibility.score}%</span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewMode(viewMode === 'preview' ? 'code' : 'preview')}
            >
              {viewMode === 'preview' ? (
                <>
                  <Code className="w-4 h-4 mr-2" />
                  View Code
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4 mr-2" />
                  View Preview
                </>
              )}
            </Button>
            {viewMode === 'code' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(component.code);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        {viewMode === 'preview' ? (
          <div className="rounded-lg border-2 border-dashed p-6">
            <ComponentPreview component={component} />
          </div>
        ) : (
          <pre className="rounded-lg bg-gray-900 p-4 overflow-x-auto">
            <code className="text-sm text-gray-100">{component.code}</code>
          </pre>
        )}

        {component.metadata.accessibility.issues.length > 0 && (
          <Alert className="mt-4">
            <AlertDescription>
              <div className="font-medium">Accessibility Issues:</div>
              <ul className="list-disc pl-4 mt-2">
                {component.metadata.accessibility.issues.map((issue, idx) => (
                  <li key={idx}>{issue}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}

// Main component
export default function Index() {
  const [url, setUrl] = useState('');
  const fetcher = useFetcher();
  const actionData = fetcher.data;

  const handleSubmit = () => {
    if (!url.trim()) return;

    const formData = new FormData();
    formData.append('url', url.trim());

    fetcher.submit(formData, {
      method: 'post',
      action: '/extract'
    });
  };

  return (
    <div className="container mx-auto p-6">
      <Card className="max-w-6xl mx-auto">
        <CardHeader>
          <CardTitle>FrontendXplorer - Extract UI Components</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Enter a URL to extract UI components"
              className="flex-1"
              required
            />
            <Button
              onClick={handleSubmit}
              disabled={fetcher.state === 'submitting'}
            >
              {fetcher.state === 'submitting' ? 'Extracting...' : 'Extract Components'}
            </Button>
          </div>

          {fetcher.state === 'loading' && (
            <div className="mt-4 text-center">
              <p className="text-gray-500">Analyzing webpage and extracting components...</p>
            </div>
          )}

          {actionData?.success ? (
            <Tabs defaultValue="all" className="mt-6">
              <TabsList>
                <TabsTrigger value="all">
                  All Components ({actionData.components.length})
                </TabsTrigger>
                {Object.entries(actionData.components.reduce((acc, component) => {
                  if (!acc[component.type]) acc[component.type] = [];
                  acc[component.type].push(component);
                  return acc;
                }, {} as Record<string, ExtractedComponent[]>)).map(([type, components]) => (
                  <TabsTrigger key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)} ({components.length})
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value="all">
                <div className="grid grid-cols-1 gap-6">
                  {actionData.components.map((component, index) => (
                    <UIComponent key={index} component={component} />
                  ))}
                </div>
              </TabsContent>

              {Object.entries(actionData.components.reduce((acc, component) => {
                if (!acc[component.type]) acc[component.type] = [];
                acc[component.type].push(component);
                return acc;
              }, {} as Record<string, ExtractedComponent[]>)).map(([type, components]) => (
                <TabsContent key={type} value={type}>
                  <div className="grid grid-cols-1 gap-6">
                    {components.map((component, index) => (
                      <UIComponent key={index} component={component} />
                    ))}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          ) : (
            actionData?.success === false && (
              <Alert className="mt-4">
                <AlertDescription>{actionData.error}</AlertDescription>
              </Alert>
            )
          )}
        </CardContent>
      </Card>
    </div>
  );
}