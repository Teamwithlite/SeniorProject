// app/components/ComponentComparison.tsx
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '~/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '~/components/ui/tabs';
import { Button } from '~/components/ui/button';
import { Slider } from '~/components/ui/slider';
import { LayoutGrid, ArrowLeft, ArrowRight, Maximize2, Minimize2 } from 'lucide-react';
import type { ExtractedComponent } from '~/types';

interface ComponentComparisonProps {
  component: ExtractedComponent;
  originalScreenshot: string;
}

export const ComponentComparison: React.FC<ComponentComparisonProps> = ({ 
  component, 
  originalScreenshot 
}) => {
  const [viewMode, setViewMode] = useState<'side-by-side' | 'overlay'>('side-by-side');
  const [overlayPosition, setOverlayPosition] = useState(50);
  const [zoom, setZoom] = useState(100);
  
  return (
    <Card className="mb-6">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-700">
        <CardTitle className="text-lg flex justify-between items-center">
          <span>Component Validation</span>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setViewMode('side-by-side')}
              className={viewMode === 'side-by-side' ? 'bg-white' : ''}
            >
              <LayoutGrid className="h-4 w-4 mr-1" />
              Side by Side
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setViewMode('overlay')}
              className={viewMode === 'overlay' ? 'bg-white' : ''}
            >
              <ArrowLeft className="h-4 w-4" />
              <ArrowRight className="h-4 w-4 ml-1" />
              Overlay
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        {viewMode === 'side-by-side' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border rounded p-2">
              <div className="text-sm font-medium mb-2 text-center">Original Component</div>
              <div className="overflow-auto" style={{ maxHeight: '400px' }}>
                <div style={{ transform: `scale(${zoom/100})`, transformOrigin: 'top left' }}>
                  <img src={originalScreenshot} alt="Original Component" className="max-w-full" />
                </div>
              </div>
            </div>
            <div className="border rounded p-2">
              <div className="text-sm font-medium mb-2 text-center">Extracted Component</div>
              <div className="overflow-auto" style={{ maxHeight: '400px' }}>
                <div 
                  style={{ transform: `scale(${zoom/100})`, transformOrigin: 'top left' }}
                  dangerouslySetInnerHTML={{ __html: component.html }}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="relative border rounded">
            <div className="text-sm font-medium mb-2 text-center">
              Slide to compare original (left) and extracted (right)
            </div>
            <div className="mb-2">
              <Slider
                min={0}
                max={100}
                step={1}
                value={[overlayPosition]}
                onValueChange={(values) => setOverlayPosition(values[0])}
              />
            </div>
            <div className="relative h-80 overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
                <img 
                  src={originalScreenshot} 
                  alt="Original Component" 
                  className="max-w-full"
                  style={{ transform: `scale(${zoom/100})`, transformOrigin: 'top left' }}
                />
              </div>
              <div 
                className="absolute top-0 right-0 h-full overflow-hidden"
                style={{ 
                  width: `${100 - overlayPosition}%`,
                  transform: `scale(${zoom/100})`, 
                  transformOrigin: 'top right'
                }}
              >
                <div 
                  dangerouslySetInnerHTML={{ __html: component.html }}
                  style={{ position: 'absolute', top: 0, right: 0 }}
                />
              </div>
              <div 
                className="absolute top-0 bottom-0 w-0.5 bg-blue-500"
                style={{ left: `${overlayPosition}%` }}
              ></div>
            </div>
          </div>
        )}
        
        <div className="flex justify-center gap-4 mt-4">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setZoom(Math.max(50, zoom - 10))}
            disabled={zoom <= 50}
          >
            <Minimize2 className="h-4 w-4" />
          </Button>
          <div className="text-sm flex items-center">
            Zoom: {zoom}%
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setZoom(Math.min(200, zoom + 10))}
            disabled={zoom >= 200}
          >
            <Maximize2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};