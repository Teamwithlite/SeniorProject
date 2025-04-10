// app/routes/code-test.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Link } from '@remix-run/react';
import type { MetaFunction } from '@remix-run/node';

// Import UI components
import { Card, CardHeader, CardTitle, CardContent } from '~/components/ui/card';
import { Button } from '~/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '~/components/ui/tabs';
import { Separator } from '~/components/ui/separator';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Slider } from '~/components/ui/slider';
import { Badge } from '~/components/ui/badge';
import { Alert, AlertDescription } from '~/components/ui/alert';

// Import icons
import { 
  Play, 
  Code, 
  Copy, 
  Check, 
  Layout, 
  ArrowLeft, 
  Smartphone,
  Tablet,
  Monitor,
  AlertTriangle,
  Eye,
  Sun,
  Moon
} from 'lucide-react';

export const meta: MetaFunction = () => {
  return [
    { title: "FrontendXplorer - Code Testing" },
    { name: "description", content: "Test and verify extracted frontend components" },
  ];
};

export default function CodeTestPage() {
  const [code, setCode] = useState('');
  const [editedCode, setEditedCode] = useState('');
  const [showEditedPreview, setShowEditedPreview] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState('custom');
  const [codeError, setCodeError] = useState('');
  
  // Element preview dimensions
  const [previewWidth, setPreviewWidth] = useState(375);
  const [previewHeight, setPreviewHeight] = useState(500);
  
  // Refs
  const previewRef = useRef<HTMLDivElement>(null);
  const codeEditorRef = useRef<HTMLTextAreaElement>(null);
  
  // Initialize with sample code
  useEffect(() => {
    const sampleCode = `<div class="extracted-component buttons-component" style="display: inline-block; width: auto; height: auto; position: relative; box-sizing: border-box;"><button class="ScCoreButton-sc-ocjdkq-0 kIbAir ScButtonIcon-sc-9yap0r-0 eSFFfM" aria-label="More Options" data-a-target="ellipsis-button" style="display: flex; position: relative; float: none; clear: none; visibility: visible; flex-flow: row; flex: 0 0 auto; place-content: normal center; align-items: center; align-self: auto; grid-template-columns: none; grid-template-rows: none; grid-area: auto; width: 30px; min-width: auto; max-width: none; height: 30px; min-height: auto; max-height: none; padding: 0px; margin: 0px; box-sizing: border-box; border: 0px none rgb(239, 239, 241); border-radius: 4px; outline: rgb(239, 239, 241) none 0px; color: rgb(239, 239, 241); background: none 0% 0% / auto repeat scroll padding-box border-box rgba(0, 0, 0, 0); font-family: Inter, Roobert, \"Helvetica Neue\", Helvetica, Arial, sans-serif; font-size: 13px; font-weight: 600; font-style: normal; font-variant: normal; text-align: start; text-decoration: none solid rgb(239, 239, 241); text-transform: none; text-indent: 0px; line-height: 19.5px; letter-spacing: normal; word-spacing: 0px; white-space: nowrap; vertical-align: middle; text-shadow: none; text-overflow: clip; word-break: normal; overflow-wrap: normal; opacity: 1; box-shadow: none; transform: none; transform-origin: 15px 15px; transition: all; animation: 0s ease 0s 1 normal none running none; filter: none; backdrop-filter: none; z-index: auto; overflow: hidden; cursor: default; pointer-events: auto; user-select: none;"><div class="ButtonIconFigure-sc-1emm8lf-0 buvMbr" style="display: block; position: static; float: none; clear: none; visibility: visible; flex-direction: row; flex-wrap: nowrap; flex-grow: 0; flex-shrink: 1; flex-basis: auto; justify-content: normal; align-items: normal; align-content: normal; align-self: auto; grid-template-columns: none; grid-template-rows: none; grid-column: auto; grid-row: auto; width: 20px; min-width: auto; max-width: none; height: 20px; min-height: auto; max-height: none; padding: 0px; padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 0px; margin: 0px; margin-top: 0px; margin-right: 0px; margin-bottom: 0px; margin-left: 0px; box-sizing: border-box; border: 0px none rgb(239, 239, 241); border-width: 0px; border-style: none; border-color: rgb(239, 239, 241); border-top: 0px none rgb(239, 239, 241); border-right: 0px none rgb(239, 239, 241); border-bottom: 0px none rgb(239, 239, 241); border-left: 0px none rgb(239, 239, 241); border-radius: 0px; border-top-left-radius: 0px; border-top-right-radius: 0px; border-bottom-right-radius: 0px; border-bottom-left-radius: 0px; outline: rgb(239, 239, 241) none 0px; outline-width: 0px; outline-style: none; outline-color: rgb(239, 239, 241); color: rgb(239, 239, 241); background: rgba(0, 0, 0, 0) none repeat scroll 0% 0% / auto padding-box border-box; background-color: rgba(0, 0, 0, 0); background-image: none; background-repeat: repeat; background-position: 0% 0%; background-size: auto; background-attachment: scroll; background-origin: padding-box; background-clip: border-box; font-family: Inter, Roobert, \"Helvetica Neue\", Helvetica, Arial, sans-serif; font-size: 13px; font-weight: 600; font-style: normal; font-variant: normal; text-align: start; text-decoration: none solid rgb(239, 239, 241); text-transform: none; text-indent: 0px; line-height: 19.5px; letter-spacing: normal; word-spacing: 0px; white-space: nowrap; vertical-align: baseline; text-shadow: none; text-overflow: clip; word-break: normal; word-wrap: normal; opacity: 1; box-shadow: none; transform: none; transform-origin: 10px 10px; transition: all; animation: none 0s ease 0s 1 normal none running; filter: none; backdrop-filter: none; z-index: auto; overflow: visible; overflow-x: visible; overflow-y: visible; cursor: default; pointer-events: none; user-select: none; "><div class="ScSvgWrapper-sc-wkgzod-0 jHiZwZ tw-svg" style="display: inline-flex; position: static; float: none; clear: none; visibility: visible; flex-direction: row; flex-wrap: nowrap; flex-grow: 0; flex-shrink: 1; flex-basis: auto; justify-content: normal; align-items: center; align-content: normal; align-self: auto; grid-template-columns: none; grid-template-rows: none; grid-column: auto; grid-row: auto; width: 20px; min-width: 0px; max-width: none; height: 20px; min-height: 0px; max-height: none; padding: 0px; padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 0px; margin: 0px; margin-top: 0px; margin-right: 0px; margin-bottom: 0px; margin-left: 0px; box-sizing: border-box; border: 0px none rgb(239, 239, 241); border-width: 0px; border-style: none; border-color: rgb(239, 239, 241); border-top: 0px none rgb(239, 239, 241); border-right: 0px none rgb(239, 239, 241); border-bottom: 0px none rgb(239, 239, 241); border-left: 0px none rgb(239, 239, 241); border-radius: 0px; border-top-left-radius: 0px; border-top-right-radius: 0px; border-bottom-right-radius: 0px; border-bottom-left-radius: 0px; outline: rgb(239, 239, 241) none 0px; outline-width: 0px; outline-style: none; outline-color: rgb(239, 239, 241); color: rgb(239, 239, 241); background: rgba(0, 0, 0, 0) none repeat scroll 0% 0% / auto padding-box border-box; background-color: rgba(0, 0, 0, 0); background-image: none; background-repeat: repeat; background-position: 0% 0%; background-size: auto; background-attachment: scroll; background-origin: padding-box; background-clip: border-box; font-family: Inter, Roobert, \"Helvetica Neue\", Helvetica, Arial, sans-serif; font-size: 13px; font-weight: 600; font-style: normal; font-variant: normal; text-align: start; text-decoration: none solid rgb(239, 239, 241); text-transform: none; text-indent: 0px; line-height: 19.5px; letter-spacing: normal; word-spacing: 0px; white-space: nowrap; vertical-align: baseline; text-shadow: none; text-overflow: clip; word-break: normal; word-wrap: normal; opacity: 1; box-shadow: none; transform: none; transform-origin: 10px 10px; transition: all; animation: none 0s ease 0s 1 normal none running; filter: none; backdrop-filter: none; z-index: auto; overflow: visible; overflow-x: visible; overflow-y: visible; cursor: default; pointer-events: none; user-select: none; "><svg width="20" height="20" viewBox="0 0 20 20" focusable="false" aria-hidden="true" role="presentation"><path d="M10 18a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm0-6a2 2 0 1 1 0-4 2 2 0 0 1 0 4zM8 4a2 2 0 1 0 4 0 2 2 0 0 0-4 0z"></path></svg></div></div></button><style>
                        .extracted-component [data-background-image] {
                          background-image: url(attr(data-background-image)) !important;
                          background-size: cover !important;
                          background-position: center !important;
                          background-repeat: no-repeat !important;
                        }
                      </style><style>button { text-align: inherit; }
* { margin: 0px; padding: 0px; box-sizing: border-box; }
button { border: none; background: none; border-radius: 0px; color: inherit; font: inherit; }
.kIbAir { display: inline-flex; position: relative; -webkit-box-align: center; align-items: center; -webkit-box-pack: center; justify-content: center; vertical-align: middle; overflow: hidden; text-decoration: none; white-space: nowrap; user-select: none; font-weight: var(--font-weight-semibold); font-size: var(--button-text-default); height: var(--button-size-default); border-radius: var(--input-border-radius-default); background-color: var(--color-background-button-text-default); color: var(--color-text-button-text); }
.eSFFfM { display: inline-flex; -webkit-box-align: center; align-items: center; -webkit-box-pack: center; justify-content: center; user-select: none; border-radius: var(--border-radius-medium); height: var(--button-size-default); width: var(--button-size-default); background-color: var(--color-background-button-text-default); color: var(--color-fill-button-icon); }</style></div>`;
    
    setCode(sampleCode);
    setEditedCode(sampleCode);

    // Check for code from sessionStorage if available
    if (typeof window !== 'undefined') {
      const storedCode = sessionStorage.getItem('codeTestContent');
      if (storedCode) {
        setCode(storedCode);
        setEditedCode(storedCode);
      }
    }
  }, []);

  // Apply custom CSS variables to make the button visible
  const getCustomCssVariables = () => {
    return `
      :root {
        --font-weight-semibold: 600;
        --button-text-default: 13px;
        --button-size-default: 30px;
        --input-border-radius-default: 4px;
        --color-background-button-text-default: ${isDarkMode ? '#3a3a3d' : '#efeff1'};
        --color-text-button-text: ${isDarkMode ? '#efeff1' : '#18181b'};
        --border-radius-medium: 4px;
        --color-fill-button-icon: ${isDarkMode ? '#efeff1' : '#18181b'};
      }
      body { 
        background-color: ${isDarkMode ? '#18181b' : '#ffffff'};
        padding: 20px;
        display: flex;
        justify-content: center;
        align-items: center;
        color: ${isDarkMode ? '#efeff1' : '#18181b'};
      }
    `;
  };

  const handleRunCode = () => {
    setShowEditedPreview(true);
    setCodeError('');
    
    // Try to render the code in the preview to check for errors
    try {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = editedCode;
      
      // Store code in sessionStorage for persistence
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('codeTestContent', editedCode);
      }
    } catch (error) {
      setCodeError(error instanceof Error ? error.message : 'Invalid HTML/CSS code');
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(editedCode);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handlePresetSelect = (preset: string) => {
    setSelectedPreset(preset);
    
    switch (preset) {
      case 'mobile':
        setPreviewWidth(375);
        setPreviewHeight(667);
        break;
      case 'tablet':
        setPreviewWidth(768);
        setPreviewHeight(1024);
        break;
      case 'desktop':
        setPreviewWidth(1280);
        setPreviewHeight(800);
        break;
      default:
        // Keep current size for custom
        break;
    }
  };

  const resetCode = () => {
    setEditedCode(code);
    setShowEditedPreview(false);
  };

  return (
    <div className="container mx-auto p-6">
      <Card className="max-w-6xl mx-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Code Testing Playground</CardTitle>
          <div className="flex gap-2">
            <Link to="/">
              <Button variant="outline" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Extract
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Editor Section */}
            <div className="flex flex-col h-full">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-lg font-semibold">Edit Code</h2>
                <div className="flex gap-2">
                  <Button 
                    onClick={handleRunCode} 
                    variant="default"
                    size="sm"
                  >
                    <Play className="mr-2 h-4 w-4" /> 
                    Run
                  </Button>
                  <Button 
                    onClick={copyToClipboard} 
                    variant="outline"
                    size="sm"
                  >
                    {isCopied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
                    {isCopied ? 'Copied' : 'Copy'}
                  </Button>
                  <Button 
                    onClick={resetCode} 
                    variant="outline"
                    size="sm"
                  >
                    Reset
                  </Button>
                </div>
              </div>
              <textarea
                ref={codeEditorRef}
                className="w-full h-96 p-4 font-mono text-sm border border-gray-300 rounded"
                value={editedCode}
                onChange={(e) => setEditedCode(e.target.value)}
                placeholder="Paste your HTML/CSS code here..."
              />
              
              {codeError && (
                <Alert variant="destructive" className="mt-4">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    {codeError}
                  </AlertDescription>
                </Alert>
              )}
            </div>
            
            {/* Preview Section */}
            <div className="flex flex-col h-full">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-lg font-semibold">Preview</h2>
                <div className="flex items-center gap-2">
                  <Button
                    variant={isDarkMode ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setIsDarkMode(!isDarkMode)}
                    title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                  >
                    {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant={isFullScreen ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setIsFullScreen(!isFullScreen)}
                    title={isFullScreen ? 'Exit Full Screen' : 'Full Screen Preview'}
                  >
                    <Layout className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="flex gap-2 mb-4">
                <Button 
                  variant={selectedPreset === 'mobile' ? 'default' : 'outline'}
                  size="sm" 
                  onClick={() => handlePresetSelect('mobile')}
                >
                  <Smartphone className="h-4 w-4 mr-2" /> Mobile
                </Button>
                <Button 
                  variant={selectedPreset === 'tablet' ? 'default' : 'outline'}
                  size="sm" 
                  onClick={() => handlePresetSelect('tablet')}
                >
                  <Tablet className="h-4 w-4 mr-2" /> Tablet
                </Button>
                <Button 
                  variant={selectedPreset === 'desktop' ? 'default' : 'outline'}
                  size="sm" 
                  onClick={() => handlePresetSelect('desktop')}
                >
                  <Monitor className="h-4 w-4 mr-2" /> Desktop
                </Button>
                <Button 
                  variant={selectedPreset === 'custom' ? 'default' : 'outline'}
                  size="sm" 
                  onClick={() => handlePresetSelect('custom')}
                >
                  Custom
                </Button>
              </div>
              
              {selectedPreset === 'custom' && (
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <Label htmlFor="width">Width (px)</Label>
                    <Input
                      id="width"
                      type="number"
                      value={previewWidth}
                      onChange={(e) => setPreviewWidth(Number(e.target.value))}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <Label htmlFor="height">Height (px)</Label>
                    <Input
                      id="height"
                      type="number"
                      value={previewHeight}
                      onChange={(e) => setPreviewHeight(Number(e.target.value))}
                      className="w-full"
                    />
                  </div>
                </div>
              )}
              
              <div 
                className={`bg-gray-100 dark:bg-gray-800 rounded border border-gray-300 dark:border-gray-700 flex items-center justify-center p-4 ${
                  isFullScreen ? 'h-96' : ''}`}
                style={{ 
                  width: isFullScreen ? '100%' : `${previewWidth}px`, 
                  height: isFullScreen ? '100%' : `${previewHeight}px`,
                  maxWidth: '100%',
                  maxHeight: isFullScreen ? '100%' : `${previewHeight}px`,
                  overflow: 'auto'
                }}
              >
                <div 
                  ref={previewRef}
                  className="w-full h-full component-preview-container flex items-center justify-center"
                >
                  <style dangerouslySetInnerHTML={{ __html: getCustomCssVariables() }} />
                  {showEditedPreview ? (
                    <div dangerouslySetInnerHTML={{ __html: editedCode }} />
                  ) : (
                    <div dangerouslySetInnerHTML={{ __html: code }} />
                  )}
                </div>
              </div>
              
              <div className="mt-4 flex justify-between items-center">
                <Badge variant={showEditedPreview ? "default" : "outline"}>
                  {showEditedPreview ? 'Showing Edited Code' : 'Showing Original Code'}
                </Badge>
                <div className="text-sm text-gray-500">
                  {previewWidth} × {previewHeight}px
                </div>
              </div>
            </div>
          </div>
          
          <Separator className="my-6" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-lg font-semibold mb-4">How to Use This Tool</h2>
              <ol className="list-decimal ml-5 space-y-2">
                <li>Paste extracted component code in the editor.</li>
                <li>Click the "Run" button to render the component.</li>
                <li>Modify the code to make adjustments and test changes.</li>
                <li>Use the preset size buttons or customize dimensions to test responsiveness.</li>
                <li>Toggle dark mode to see how your component looks with different backgrounds.</li>
              </ol>
            </div>
            
            <div>
              <h2 className="text-lg font-semibold mb-4">Troubleshooting Tips</h2>
              <ul className="list-disc ml-5 space-y-2">
                <li>If component doesn't render, check the code for missing CSS variables.</li>
                <li>For components with missing styles, ensure all required CSS is included.</li>
                <li>Some components may need browser-specific prefixes for proper display.</li>
                <li>Components with external dependencies may not render correctly.</li>
                <li>Check browser console for additional error information.</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}