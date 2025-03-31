// app/routes/metrics.tsx
import { useState, useEffect } from 'react';  // Direct import of hooks
import { Link } from '@remix-run/react';
import { Card, CardHeader, CardTitle, CardContent } from '~/components/ui/card';
import { Button } from '~/components/ui/button';
import { Badge } from '~/components/ui/badge';
import { ChevronLeft, Download, Trash2 } from 'lucide-react';
import { MetricsPanel, type ExtractionMetrics } from '~/components/MetricsPanel';
import { Alert, AlertDescription } from '~/components/ui/alert';

export default function MetricsPage() {
  const [currentMetrics, setCurrentMetrics] = useState<ExtractionMetrics | null>(null);
  const [historicalMetrics, setHistoricalMetrics] = useState<ExtractionMetrics[]>([]);

  useEffect(() => {
    // Load current metrics
    try {
      const storedMetrics = localStorage.getItem('extractionMetrics');
      if (storedMetrics) {
        setCurrentMetrics(JSON.parse(storedMetrics));
      }
      
      // Load historical metrics
      const storedHistory = localStorage.getItem('metricsHistory');
      if (storedHistory) {
        setHistoricalMetrics(JSON.parse(storedHistory));
      }
    } catch (e) {
      console.error('Error loading metrics:', e);
    }
  }, []);
  
  const saveMetricsToHistory = () => {
    if (!currentMetrics) return;
    
    // Add current metrics to history if it doesn't exist
    const exists = historicalMetrics.some(m => 
      m.url === currentMetrics.url && m.timestamp === currentMetrics.timestamp
    );
    
    if (!exists) {
      const updatedHistory = [currentMetrics, ...historicalMetrics].slice(0, 10); // Keep last 10
      setHistoricalMetrics(updatedHistory);
      
      try {
        localStorage.setItem('metricsHistory', JSON.stringify(updatedHistory));
      } catch (e) {
        console.error('Error saving metrics history:', e);
      }
    }
  };
  
  const clearMetricsHistory = () => {
    setHistoricalMetrics([]);
    localStorage.removeItem('metricsHistory');
  };
  
  const exportMetricsAsJson = () => {
    if (!currentMetrics) return;
    
    const dataStr = JSON.stringify(currentMetrics, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const downloadLink = document.createElement('a');
    downloadLink.setAttribute('href', dataUri);
    downloadLink.setAttribute('download', `metrics_${new Date().toISOString().slice(0,10)}.json`);
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };
  
  return (
    <div className="container mx-auto p-6">
      <Card className="max-w-6xl mx-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Extraction Metrics Dashboard</CardTitle>
          <Link to="/">
            <Button variant="outline" size="sm">
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back to Extract
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {currentMetrics ? (
            <>
              <div className="flex justify-end gap-2 mb-4">
                <Button variant="outline" size="sm" onClick={saveMetricsToHistory}>
                  Save to History
                </Button>
                <Button variant="outline" size="sm" onClick={exportMetricsAsJson}>
                  <Download className="mr-2 h-4 w-4" />
                  Export JSON
                </Button>
              </div>
              
              <MetricsPanel metrics={currentMetrics} showDetailedMetrics={true} />
              
              {historicalMetrics.length > 0 && (
                <div className="mt-8">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold">Historical Extractions</h2>
                    <Button variant="outline" size="sm" onClick={clearMetricsHistory}>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Clear History
                    </Button>
                  </div>
                  
                  <div className="space-y-4">
                    {historicalMetrics.map((metric, index) => (
                      <Card key={index} className="p-4">
                        <div className="flex justify-between items-center mb-2">
                          <h3 className="font-medium">{new Date(metric.timestamp).toLocaleString()}</h3>
                          <Badge variant={metric.overallAccuracy > 90 ? "success" : "warning"}>
                            {metric.overallAccuracy.toFixed(1)}%
                          </Badge>
                        </div>
                        <p className="text-sm mb-2 truncate">{metric.url}</p>
                        <div className="grid grid-cols-3 gap-2 text-sm">
                          <div>
                            <span className="text-gray-500">Time:</span> {formatTime(metric.extractionTimeMs)}
                          </div>
                          <div>
                            <span className="text-gray-500">Components:</span> {metric.componentsExtracted}
                          </div>
                          <div>
                            <span className="text-gray-500">Success Rate:</span> {metric.extractionRate.toFixed(1)}%
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <Alert>
              <AlertDescription>
                No metrics available. Extract components first to generate metrics.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Helper function to format time
const formatTime = (ms: number): string => {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
};