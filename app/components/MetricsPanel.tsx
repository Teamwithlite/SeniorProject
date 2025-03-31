// app/components/MetricsPanel.tsx
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '~/components/ui/card';
import { Progress } from '~/components/progress';
import { Badge } from '~/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '~/components/ui/tabs';
import { Clock, Target, CheckCircle, XCircle, BarChart } from 'lucide-react';

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
  
  return (
    <Card className="mb-6 overflow-hidden border-2">
      <CardHeader className="bg-blue-50 dark:bg-gray-800">
        <CardTitle className="text-lg flex items-center justify-between">
          <span>Extraction Metrics</span>
          <Badge variant={metrics.overallAccuracy > 90 ? "success" : metrics.overallAccuracy > 70 ? "warning" : "destructive"}>
            {metrics.overallAccuracy.toFixed(1)}% Overall Accuracy
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
                  {metrics.layoutAccuracy.toFixed(1)}%
                </div>
                <Progress value={metrics.layoutAccuracy} className="h-2 mt-2" />
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
              </ul>
            </div>
          </TabsContent>
          
          {showDetailedMetrics && (
            <>
              <TabsContent value="accuracy" className="space-y-4">
                {/* Detailed accuracy metrics would go here */}
              </TabsContent>
              <TabsContent value="performance" className="space-y-4">
                {/* Detailed performance metrics would go here */}
              </TabsContent>
            </>
          )}
        </Tabs>
      </CardContent>
    </Card>
  );
};