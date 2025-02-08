import React, { useState } from 'react';
import type { ActionFunction, LoaderFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Form, useFetcher } from '@remix-run/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Code, Copy, Check } from 'lucide-react';

// Loader Function
export const loader: LoaderFunction = async () => {
  return json({
    initialMessage: 'Enter a URL to extract UI components',
  });
};

// Action Function
export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const url = formData.get('url') as string;

  if (!url) {
    return json({ success: false, error: 'Please provide a valid URL' });
  }

  try {
    const response = await fetch(`${process.env.BASE_URL}/extract`, {
      method: 'POST',
      body: JSON.stringify({ url }),
      headers: { 'Content-Type': 'application/json' },
    });

    const data = await response.json();
    return json(data);
  } catch (error) {
    return json({
      success: false,
      error: 'Failed to extract UI components from the provided URL: ' + (error as Error).message,
    });
  }
};

// UI Component Display
function UIComponent({ title, preview, code }: { title: string; preview: string; code: string }) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="border rounded-lg p-4 space-y-4">
      <h3 className="font-medium">{title}</h3>
      <div className="border rounded p-4 bg-white dark:bg-gray-800">
        <div dangerouslySetInnerHTML={{ __html: preview }} />
      </div>
      <Button variant="outline" size="sm" onClick={copyToClipboard}>
        {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
        {copied ? 'Copied!' : 'Copy Code'}
      </Button>
      <pre className="bg-gray-100 p-2 rounded text-sm overflow-x-auto">{code}</pre>
    </div>
  );
}

// Main Component
export default function Index() {
  const [url, setUrl] = useState('');
  const fetcher = useFetcher();
  const actionData = fetcher.data;

  return (
    <div className="container mx-auto p-6">
      <Card className="max-w-6xl mx-auto">
        <CardHeader>
          <CardTitle>FrontendXplorer - Extract UI Components</CardTitle>
        </CardHeader>
        <CardContent>
          <Form method="post" action="/extract" className="space-y-4">
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
                  fetcher.submit(formData, { method: 'post', action: '/extract' });
                }}
                disabled={fetcher.state === 'submitting'}
              >
                {fetcher.state === 'submitting' ? 'Extracting...' : 'Extract Components'}
              </Button>
            </div>
          </Form>

          {/* Loading State */}
          {fetcher.state === 'loading' && <p className="mt-4 text-gray-500">Extracting UI components...</p>}

          {/* Success: Show Extracted Components */}
          {actionData?.success && actionData.components ? (
            <div className="mt-6 space-y-4">
              {actionData.components.map((component: any, index: number) => (
                <UIComponent key={index} title={component.name} preview={component.html} code={component.code} />
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
