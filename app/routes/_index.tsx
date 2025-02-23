// _index.tsx
import React, { useState } from 'react';
import type { ActionFunction, LoaderFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Form, useFetcher } from '@remix-run/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Code, Copy, Check, Eye } from 'lucide-react';
import type { ActionData, LoaderData, ExtractedComponent } from '~/types';
import { extractWebsite } from '~/services/extractor';

export const loader: LoaderFunction = async () => {
  return json<LoaderData>({
    initialMessage: 'Enter a URL to extract UI components',
  });
};


export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const url = formData.get('url') as string;

  if (!url) {
    return json<ActionData>({ success: false, error: 'Please provide a valid URL' });
  }

  try {
    // Use the extractor directly instead of making a fetch request
    const extractedData = await extractWebsite(url);
    return json<ActionData>({ 
      success: true, 
      components: extractedData.components 
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return json<ActionData>({
      success: false,
      error: 'Failed to extract UI components: ' + errorMessage,
    });
  }
};

interface ComponentPreviewProps {
  component: ExtractedComponent;
}

function ComponentPreview({ component }: ComponentPreviewProps) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('preview');

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(component.cleanHtml || component.html);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="mb-6 overflow-hidden border-2 border-periwinkle-200">
      <CardHeader className="bg-nyanza-100">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2 text-white">
            {component.name}
            <Badge variant="secondary" className="text-xs">
              {component.type || 'Component'}
            </Badge>
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={copyToClipboard}
            className="text-white hover:text-nyanza-500"
          >
            {copied ? (
              <Check className="h-4 w-4 mr-2" />
            ) : (
              <Copy className="h-4 w-4 mr-2" />
            )}
            {copied ? 'Copied!' : 'Copy Code'}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs defaultValue="preview" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full border-b">
            <TabsTrigger value="preview" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Preview
            </TabsTrigger>
            <TabsTrigger value="code" className="flex items-center gap-2">
              <Code className="h-4 w-4" />
              Code
            </TabsTrigger>
          </TabsList>
          <TabsContent value="preview" className="p-4">
            <div 
              className="border rounded p-4 bg-white"
              style={component.styles || {}}
              dangerouslySetInnerHTML={{ __html: component.cleanHtml || component.html }}
            />
          </TabsContent>
          <TabsContent value="code" className="p-0">
            <pre className="language-html p-4 m-0 bg-gray-50 overflow-x-auto">
              <code>{component.cleanHtml || component.html}</code>
            </pre>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

export default function Index() {
  const [url, setUrl] = useState('');
  const fetcher = useFetcher<ActionData>();
  const actionData = fetcher.data;

  return (
    <div className="container mx-auto p-6">
      <Card className="max-w-6xl mx-auto">
        <CardHeader>
          <CardTitle>FrontendXplorer - Extract UI Components</CardTitle>
        </CardHeader>
        <CardContent>
          <Form method="post" className="space-y-4">
            <div className="flex gap-2">
              <Input
                type="url"
                name="url"
                placeholder="Enter a URL to extract UI components"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="flex-1"
                required
              />
              <Button
  type="button"
  onClick={() => {
    const formData = new FormData();
    formData.append('url', url);
    fetcher.submit(formData, { method: 'post' }); // Remove the action: '/extract'
  }}
  disabled={fetcher.state === 'submitting'}
>
  {fetcher.state === 'submitting' ? 'Extracting...' : 'Extract Components'}
</Button>
            </div>
          </Form>

          {fetcher.state === 'loading' && (
            <p className="mt-4 text-gray-500">Extracting UI components...</p>
          )}

          {actionData?.success && actionData.components ? (
            <div className="mt-6 space-y-4">
              {actionData.components.map((component, index) => (
                <ComponentPreview 
                  key={`${component.type || 'component'}-${index}`} 
                  component={component} 
                />
              ))}
            </div>
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