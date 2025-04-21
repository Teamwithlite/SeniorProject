// app/components/MetricsPanel.tsx
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '~/components/ui/card';
import { Progress } from '~/components/progress';
import { Badge } from '~/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '~/components/ui/tabs';
import { Clock, Target, CheckCircle, XCircle, BarChart, Layout } from 'lucide-react';

export interface ExtractionMetrics {
  // Time metrics
  extractionTimeMs: number;
  responseTimeMs: number;
  
  // Accuracy metrics
  layoutAccuracy: number;
  styleAccuracy: number;
  contentAccuracy: number;
  overallAccuracy: number;
  
  // Component metrics
  totalElementsDetected: number;
  componentsExtracted: number;
  extractionRate: number;
  failedExtractions: number;
  
  // Precision metrics
  positionAccuracy: number;
  dimensionAccuracy: number;
  marginPaddingAccuracy: number;
  alignmentAccuracy: number; // Added alignment accuracy
  colorAccuracy: number;
  fontAccuracy: number;
  
  // Error details
  errors: Array<{type: string, message: string, count: number}>;
  
  // URL and timestamp
  url: string;
  timestamp: string;
}

interface MetricsPanelProps {
  metrics: ExtractionMetrics;
  showDetailedMetrics?: boolean;
}

const formatTime = (ms: number): string => {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
};

export const MetricsPanel = ({ metrics, showDetailedMetrics = false }: MetricsPanelProps) => {
  const isResponseTimeWithinSpec = metrics.responseTimeMs < 5000;
  
  // Calculate adjusted layout accuracy if alignment accuracy is missing
  const hasAlignmentAccuracy = metrics.alignmentAccuracy !== undefined && !isNaN(metrics.alignmentAccuracy);
  
  // Calculate adjusted layout accuracy without alignment if it's missing
  const adjustedLayoutAccuracy = hasAlignmentAccuracy 
    ? metrics.layoutAccuracy 
    : (metrics.positionAccuracy * 0.375 + metrics.dimensionAccuracy * 0.375 + metrics.marginPaddingAccuracy * 0.25);
  
  // Calculate adjusted overall accuracy if alignment accuracy is missing
  const adjustedOverallAccuracy = hasAlignmentAccuracy 
    ? metrics.overallAccuracy
    : (adjustedLayoutAccuracy * 0.4 + metrics.styleAccuracy * 0.4 + metrics.contentAccuracy * 0.2);
  
  return (
    <Card className="mb-6 overflow-hidden border-2">
      <CardHeader className="bg-blue-50 dark:bg-gray-800">
        <CardTitle className="text-lg flex items-center justify-between">
          <span>Extraction Metrics</span>
          <Badge variant={adjustedOverallAccuracy > 90 ? "success" : adjustedOverallAccuracy > 70 ? "warning" : "destructive"}>
            {adjustedOverallAccuracy.toFixed(1)}% Overall Accuracy
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <Tabs defaultValue="summary">
          <TabsList className="w-full mb-4">
            <TabsTrigger value="summary" className="flex-1">Summary</TabsTrigger>
            {showDetailedMetrics && (
              <>
                <TabsTrigger value="accuracy" className="flex-1">Accuracy</TabsTrigger>
                <TabsTrigger value="performance" className="flex-1">Performance</TabsTrigger>
              </>
            )}
          </TabsList>
          
          <TabsContent value="summary" className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm border">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  <Clock size={16} /> Response Time
                </div>
                <div className="text-xl font-semibold">
                  {formatTime(metrics.responseTimeMs)}
                </div>
                <Badge variant={isResponseTimeWithinSpec ? "success" : "destructive"} className="mt-2">
                  {isResponseTimeWithinSpec ? "Within spec" : "Exceeds spec"}
                </Badge>
              </div>
              
              <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm border">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  <Target size={16} /> Extraction Rate
                </div>
                <div className="text-xl font-semibold">
                  {metrics.extractionRate.toFixed(1)}%
                </div>
                <div className="mt-2 text-sm">
                  {metrics.componentsExtracted} of {metrics.totalElementsDetected} elements
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm border">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  <CheckCircle size={16} /> Layout Accuracy
                </div>
                <div className="text-xl font-semibold">
                  {adjustedLayoutAccuracy.toFixed(1)}%
                </div>
                <Progress value={adjustedLayoutAccuracy} className="h-2 mt-2" />
              </div>
              
              <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm border">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  <BarChart size={16} /> Style Fidelity
                </div>
                <div className="text-xl font-semibold">
                  {metrics.styleAccuracy.toFixed(1)}%
                </div>
                <Progress value={metrics.styleAccuracy} className="h-2 mt-2" />
              </div>
            </div>
            
            {/* Position Accuracy */}
            <div className="mt-4">
              <h3 className="font-medium mb-2 text-sm">Layout Metrics:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm border">
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Position Accuracy
                  </div>
                  <div className="text-xl font-semibold">
                    {metrics.positionAccuracy.toFixed(1)}%
                  </div>
                  <Progress value={metrics.positionAccuracy} className="h-2 mt-2" />
                  <div className="text-xs text-gray-500 mt-1">Target: ±2px</div>
                </div>
                
                <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm border">
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Dimension Accuracy
                  </div>
                  <div className="text-xl font-semibold">
                    {metrics.dimensionAccuracy.toFixed(1)}%
                  </div>
                  <Progress value={metrics.dimensionAccuracy} className="h-2 mt-2" />
                  <div className="text-xs text-gray-500 mt-1">Target: Within 1%</div>
                </div>
                
                <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm border">
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Margin/Padding
                  </div>
                  <div className="text-xl font-semibold">
                    {metrics.marginPaddingAccuracy.toFixed(1)}%
                  </div>
                  <Progress value={metrics.marginPaddingAccuracy} className="h-2 mt-2" />
                  <div className="text-xs text-gray-500 mt-1">Target: ±2px</div>
                </div>
                
                {/* Alignment Accuracy - Show only if available
                <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm border">
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Alignment Accuracy
                  </div>
                  <div className="text-xl font-semibold">
                    {hasAlignmentAccuracy ? `${metrics.alignmentAccuracy.toFixed(1)}%` : "N/A"}
                  </div>
                  <Progress value={hasAlignmentAccuracy ? metrics.alignmentAccuracy : 0} className="h-2 mt-2" />
                  <div className="text-xs text-gray-500 mt-1">Flex/Grid layout</div>
                </div> */}
                
                <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm border">
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Overall Layout
                  </div>
                  <div className="text-xl font-semibold">
                    {adjustedLayoutAccuracy.toFixed(1)}%
                  </div>
                  <Progress value={adjustedLayoutAccuracy} className="h-2 mt-2" />
                </div>
              </div>
            </div>
            
            {/* Style Metrics */}
            <div className="mt-4">
              <h3 className="font-medium mb-2 text-sm">Style Metrics:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm border">
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Color Accuracy
                  </div>
                  <div className="text-xl font-semibold">
                    {metrics.colorAccuracy.toFixed(1)}%
                  </div>
                  <Progress value={metrics.colorAccuracy} className="h-2 mt-2" />
                  <div className="text-xs text-gray-500 mt-1">Target: ±1 hex value</div>
                </div>
                
                <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm border">
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Typography
                  </div>
                  <div className="text-xl font-semibold">
                    {metrics.fontAccuracy.toFixed(1)}%
                  </div>
                  <Progress value={metrics.fontAccuracy} className="h-2 mt-2" />
                  <div className="text-xs text-gray-500 mt-1">Font size, line height, spacing</div>
                </div>
                
                <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm border">
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Overall Style
                  </div>
                  <div className="text-xl font-semibold">
                    {metrics.styleAccuracy.toFixed(1)}%
                  </div>
                  <Progress value={metrics.styleAccuracy} className="h-2 mt-2" />
                </div>
              </div>
            </div>
            
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <h3 className="font-medium mb-2">Key Insights:</h3>
              <ul className="space-y-1 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">
                    <CheckCircle size={16} />
                  </span>
                  <span>Successfully extracted {metrics.componentsExtracted} components in {formatTime(metrics.extractionTimeMs)}</span>
                </li>
                {metrics.failedExtractions > 0 && (
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-0.5">
                      <XCircle size={16} />
                    </span>
                    <span>{metrics.failedExtractions} components failed to extract properly</span>
                  </li>
                )}
                <li className="flex items-start gap-2">
                  <span className={metrics.positionAccuracy > 95 ? "text-green-500 mt-0.5" : "text-yellow-500 mt-0.5"}>
                    {metrics.positionAccuracy > 95 ? <CheckCircle size={16} /> : <Target size={16} />}
                  </span>
                  <span>Position accuracy: {metrics.positionAccuracy.toFixed(1)}% (Target: ±2px)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className={metrics.colorAccuracy > 95 ? "text-green-500 mt-0.5" : "text-yellow-500 mt-0.5"}>
                    {metrics.colorAccuracy > 95 ? <CheckCircle size={16} /> : <Target size={16} />}
                  </span>
                  <span>Color values accuracy: {metrics.colorAccuracy.toFixed(1)}% (Target: ±1 in hex value)</span>
                </li>
                {/* Show alignment accuracy in insights only if available */}
                {hasAlignmentAccuracy && (
                  <li className="flex items-start gap-2">
                    <span className={metrics.alignmentAccuracy > 95 ? "text-green-500 mt-0.5" : "text-yellow-500 mt-0.5"}>
                      {metrics.alignmentAccuracy > 95 ? <CheckCircle size={16} /> : <Target size={16} />}
                    </span>
                    <span>Alignment accuracy: {metrics.alignmentAccuracy.toFixed(1)}% (Flex/Grid layouts)</span>
                  </li>
                )}
              </ul>
            </div>
          </TabsContent>
          
          {showDetailedMetrics && (
            <>
              <TabsContent value="accuracy" className="space-y-4">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-3">Layout Precision</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium mb-2">Position Accuracy</h4>
                        <div className="flex justify-between text-sm mb-1">
                          <span>±2px margin of error</span>
                          <span>{metrics.positionAccuracy.toFixed(1)}%</span>
                        </div>
                        <Progress value={metrics.positionAccuracy} className="h-3" />
                        <p className="text-xs text-gray-500 mt-1">
                          How accurately the x/y coordinates are preserved
                        </p>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium mb-2">Dimension Accuracy</h4>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Within 1% of original size</span>
                          <span>{metrics.dimensionAccuracy.toFixed(1)}%</span>
                        </div>
                        <Progress value={metrics.dimensionAccuracy} className="h-3" />
                        <p className="text-xs text-gray-500 mt-1">
                          How accurately width and height are preserved
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div>
                        <h4 className="text-sm font-medium mb-2">Margin/Padding Accuracy</h4>
                        <div className="flex justify-between text-sm mb-1">
                          <span>±2px tolerance</span>
                          <span>{metrics.marginPaddingAccuracy.toFixed(1)}%</span>
                        </div>
                        <Progress value={metrics.marginPaddingAccuracy} className="h-3" />
                        <p className="text-xs text-gray-500 mt-1">
                          How accurately spacing is preserved
                        </p>
                      </div>
                      
                      {/* Show alignment accuracy in detailed view only if available */}
                      {hasAlignmentAccuracy && (
                        <div>
                          <h4 className="text-sm font-medium mb-2">Alignment Accuracy</h4>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Flex/Grid alignment</span>
                            <span>{metrics.alignmentAccuracy.toFixed(1)}%</span>
                          </div>
                          <Progress value={metrics.alignmentAccuracy} className="h-3" />
                          <p className="text-xs text-gray-500 mt-1">
                            How accurately flex/grid properties are preserved (direction, justify-content, etc.)
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-3">Style Fidelity</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium mb-2">Color Accuracy</h4>
                        <div className="flex justify-between text-sm mb-1">
                          <span>±1 in hex value</span>
                          <span>{metrics.colorAccuracy.toFixed(1)}%</span>
                        </div>
                        <Progress value={metrics.colorAccuracy} className="h-3" />
                        <p className="text-xs text-gray-500 mt-1">
                          How accurately colors are preserved
                        </p>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium mb-2">Typography Accuracy</h4>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Font properties</span>
                          <span>{metrics.fontAccuracy.toFixed(1)}%</span>
                        </div>
                        <Progress value={metrics.fontAccuracy} className="h-3" />
                        <p className="text-xs text-gray-500 mt-1">
                          Font size, line height, letter spacing accuracy
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="performance" className="space-y-4">
                {/* Performance content remains unchanged */}
              </TabsContent>
            </>
          )}
        </Tabs>
      </CardContent>
    </Card>
  );
};