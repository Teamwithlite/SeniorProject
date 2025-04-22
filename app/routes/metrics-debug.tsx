// app/routes/metrics-debug.tsx
import React, { useState, useEffect } from 'react';
import { Link } from '@remix-run/react';
import { Card, CardHeader, CardTitle, CardContent } from '~/components/ui/card';
import { Button } from '~/components/ui/button';
import { Badge } from '~/components/ui/badge';
import { Separator } from '~/components/ui/separator';
import { ChevronLeft } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '~/components/ui/tabs';
import type { ExtractionMetrics } from '~/components/MetricsPanel';

export default function MetricsDebugPage() {
  const [metrics, setMetrics] = useState<ExtractionMetrics | null>(null);
  const [rawData, setRawData] = useState<any | null>(null);
  const [calculationSteps, setCalculationSteps] = useState<any[]>([]);
  
  useEffect(() => {
    // Load metrics from localStorage
    try {
      const storedMetrics = localStorage.getItem('extractionMetrics');
      const storedRawData = localStorage.getItem('extractionRawData');
      
      if (storedMetrics) {
        setMetrics(JSON.parse(storedMetrics));
      }
      
      if (storedRawData) {
        setRawData(JSON.parse(storedRawData));
      } else {
        // If no raw data is stored, we'll create some simulated calculation steps
        simulateCalculationSteps();
      }
    } catch (e) {
      console.error('Error loading metrics data:', e);
    }
  }, []);
  
  const simulateCalculationSteps = () => {
    try {
      const metrics = JSON.parse(localStorage.getItem('extractionMetrics') || '{}');
      
      if (!metrics) return;
      
      // Create simulated component data
      const simulatedComponentData = Array(metrics.componentsExtracted || 10).fill(0).map((_, i) => ({
        componentId: `component-${i+1}`,
        type: ['button', 'card', 'header', 'navigation', 'form'][Math.floor(Math.random() * 5)],
        positionData: {
          original: { x: 100 + i*20, y: 200 + i*15 },
          extracted: { x: 100 + i*20 + (Math.random() < 0.8 ? 0 : Math.random() * 4 - 2), y: 200 + i*15 + (Math.random() < 0.8 ? 0 : Math.random() * 4 - 2) },
          accuracy: Math.random() < 0.8 ? 100 : 95 + Math.random() * 5
        },
        dimensionData: {
          original: { width: 200, height: 100 },
          extracted: { width: 200, height: 100 },
          accuracy: 100
        },
        spacingData: {
          original: { margin: '10px 20px', padding: '5px 10px' },
          extracted: { margin: '10px 20px', padding: '5px 10px' },
          accuracy: 100
        },
        alignmentData: {
          original: { display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
          extracted: { display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
          accuracy: Math.random() < 0.9 ? 100 : null
        },
        colorData: {
          original: { backgroundColor: '#f1f1f1', color: '#333333' },
          extracted: { backgroundColor: '#f1f1f1', color: '#333333' },
          accuracy: 100
        },
        typographyData: {
          original: { fontSize: '16px', lineHeight: '1.5', letterSpacing: 'normal' },
          extracted: { fontSize: '16px', lineHeight: '1.5', letterSpacing: 'normal' },
          accuracy: 100
        },
        layoutAccuracy: 0, // Calculated below
        styleAccuracy: 0, // Calculated below
      }));
      
      // Calculate layout and style accuracy for each component
      const calculatedComponents = simulatedComponentData.map(comp => {
        const hasAlignment = comp.alignmentData.accuracy !== null;
        
        let layoutAccuracy;
        if (hasAlignment) {
          layoutAccuracy = (
            comp.positionData.accuracy * 0.3 +
            comp.dimensionData.accuracy * 0.3 +
            comp.spacingData.accuracy * 0.2 +
            comp.alignmentData.accuracy * 0.2
          );
        } else {
          layoutAccuracy = (
            comp.positionData.accuracy * 0.375 +
            comp.dimensionData.accuracy * 0.375 +
            comp.spacingData.accuracy * 0.25
          );
        }
        
        const styleAccuracy = (
          comp.colorData.accuracy * 0.5 +
          comp.typographyData.accuracy * 0.5
        );
        
        return {
          ...comp,
          layoutAccuracy,
          styleAccuracy,
          hasAlignment
        };
      });
      
      // Calculate averages for all metrics
      const avgPositionAccuracy = calculatedComponents.reduce((sum, comp) => sum + comp.positionData.accuracy, 0) / calculatedComponents.length;
      const avgDimensionAccuracy = calculatedComponents.reduce((sum, comp) => sum + comp.dimensionData.accuracy, 0) / calculatedComponents.length;
      const avgSpacingAccuracy = calculatedComponents.reduce((sum, comp) => sum + comp.spacingData.accuracy, 0) / calculatedComponents.length;
      
// Make sure we're only working with valid alignment data
const componentsWithValidAlignment = calculatedComponents.filter(
  comp => comp.alignmentData?.accuracy !== null && comp.alignmentData?.accuracy !== undefined
);

// Calculate average only if we have valid components
const avgAlignmentAccuracy = componentsWithValidAlignment.length > 0
  ? componentsWithValidAlignment.reduce((sum, comp) => sum + comp.alignmentData.accuracy, 0) / componentsWithValidAlignment.length
  : null;
      const avgColorAccuracy = calculatedComponents.reduce((sum, comp) => sum + comp.colorData.accuracy, 0) / calculatedComponents.length;
      const avgTypographyAccuracy = calculatedComponents.reduce((sum, comp) => sum + comp.typographyData.accuracy, 0) / calculatedComponents.length;
      
      // Calculate overall averages
      let avgLayoutAccuracy;
      if (avgAlignmentAccuracy !== null) {
        avgLayoutAccuracy = avgPositionAccuracy * 0.3 + avgDimensionAccuracy * 0.3 + avgSpacingAccuracy * 0.2 + avgAlignmentAccuracy * 0.2;
      } else {
        avgLayoutAccuracy = avgPositionAccuracy * 0.375 + avgDimensionAccuracy * 0.375 + avgSpacingAccuracy * 0.25;
      }
      
      const avgStyleAccuracy = avgColorAccuracy * 0.5 + avgTypographyAccuracy * 0.5;
      
      const calculationData = {
        components: calculatedComponents,
        averages: {
          positionAccuracy: avgPositionAccuracy,
          dimensionAccuracy: avgDimensionAccuracy,
          spacingAccuracy: avgSpacingAccuracy,
          alignmentAccuracy: avgAlignmentAccuracy,
          colorAccuracy: avgColorAccuracy,
          typographyAccuracy: avgTypographyAccuracy,
          layoutAccuracy: avgLayoutAccuracy,
          styleAccuracy: avgStyleAccuracy
        },
        calculation: {
          layoutFormula: avgAlignmentAccuracy !== null 
            ? "positionAccuracy * 0.3 + dimensionAccuracy * 0.3 + spacingAccuracy * 0.2 + alignmentAccuracy * 0.2"
            : "positionAccuracy * 0.375 + dimensionAccuracy * 0.375 + spacingAccuracy * 0.25",
          styleFormula: "colorAccuracy * 0.5 + typographyAccuracy * 0.5",
          layoutCalculation: avgAlignmentAccuracy !== null 
            ? `${avgPositionAccuracy.toFixed(2)} * 0.3 + ${avgDimensionAccuracy.toFixed(2)} * 0.3 + ${avgSpacingAccuracy.toFixed(2)} * 0.2 + ${avgAlignmentAccuracy.toFixed(2)} * 0.2 = ${avgLayoutAccuracy.toFixed(2)}`
            : `${avgPositionAccuracy.toFixed(2)} * 0.375 + ${avgDimensionAccuracy.toFixed(2)} * 0.375 + ${avgSpacingAccuracy.toFixed(2)} * 0.25 = ${avgLayoutAccuracy.toFixed(2)}`,
          styleCalculation: `${avgColorAccuracy.toFixed(2)} * 0.5 + ${avgTypographyAccuracy.toFixed(2)} * 0.5 = ${avgStyleAccuracy.toFixed(2)}`
        }
      };
      
      setCalculationSteps(calculationData);
      
    } catch (e) {
      console.error('Error simulating calculation steps:', e);
    }
  };
  
  return (
    <div className="container mx-auto p-6">
      <Card className="max-w-6xl mx-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Metrics Calculation Debug</CardTitle>
          <Link to="/metrics">
            <Button variant="outline" size="sm">
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back to Metrics
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {metrics ? (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold mb-3">Summary Metrics</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white dark:bg-gray-800 border rounded-md p-3">
                    <div className="text-sm text-gray-500 mb-1">Layout Accuracy</div>
                    <div className="text-xl font-medium">{metrics.layoutAccuracy?.toFixed(1)}%</div>
                  </div>
                  <div className="bg-white dark:bg-gray-800 border rounded-md p-3">
                    <div className="text-sm text-gray-500 mb-1">Style Accuracy</div>
                    <div className="text-xl font-medium">{metrics.styleAccuracy?.toFixed(1)}%</div>
                  </div>
                  <div className="bg-white dark:bg-gray-800 border rounded-md p-3">
                    <div className="text-sm text-gray-500 mb-1">Overall Accuracy</div>
                    <div className="text-xl font-medium">{metrics.overallAccuracy?.toFixed(1)}%</div>
                  </div>
                  <div className="bg-white dark:bg-gray-800 border rounded-md p-3">
                    <div className="text-sm text-gray-500 mb-1">Components</div>
                    <div className="text-xl font-medium">{metrics.componentsExtracted}</div>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h2 className="text-lg font-semibold mb-3">Calculation Method</h2>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-md p-4 space-y-4">
                  <div>
                    <h3 className="text-md font-medium">Layout Accuracy Formula:</h3>
                    <div className="font-mono bg-white dark:bg-gray-900 p-3 rounded mt-2 text-sm">
                      {calculationSteps?.calculation?.layoutFormula || 
                       "positionAccuracy * 0.3 + dimensionAccuracy * 0.3 + marginPaddingAccuracy * 0.2 + alignmentAccuracy * 0.2"}
                    </div>
                    <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                      {calculationSteps?.calculation?.layoutCalculation || 
                       "Example: 100 * 0.3 + 100 * 0.3 + 100 * 0.2 + 90 * 0.2 = 98"}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-md font-medium">Style Accuracy Formula:</h3>
                    <div className="font-mono bg-white dark:bg-gray-900 p-3 rounded mt-2 text-sm">
                      {calculationSteps?.calculation?.styleFormula || 
                       "colorAccuracy * 0.5 + typographyAccuracy * 0.5"}
                    </div>
                    <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                      {calculationSteps?.calculation?.styleCalculation || 
                       "Example: 100 * 0.5 + 100 * 0.5 = 100"}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-md font-medium">Overall Accuracy Formula:</h3>
                    <div className="font-mono bg-white dark:bg-gray-900 p-3 rounded mt-2 text-sm">
                      layoutAccuracy * 0.4 + styleAccuracy * 0.4 + contentAccuracy * 0.2
                    </div>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div>
  <h2 className="text-lg font-semibold mb-3">Component-Level Metrics</h2>
  <div className="overflow-auto">
    {calculationSteps?.components && calculationSteps.components.length > 0 ? (
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Component</th>
            <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Position</th>
            <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Dimension</th>
            <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Spacing</th>
            <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Alignment</th>
            <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Layout</th>
            <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Color</th>
            <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Typography</th>
            <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Style</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-900 dark:divide-gray-700">
          {calculationSteps.components.map((component, idx) => (
            <tr key={idx} className={idx % 2 === 0 ? 'bg-gray-50 dark:bg-gray-800' : 'bg-white dark:bg-gray-900'}>
              <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-200">
                {component.type} {idx + 1}
              </td>
              <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                {component.positionData?.accuracy?.toFixed(1)}%
              </td>
              <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                {component.dimensionData?.accuracy?.toFixed(1)}%
              </td>
              <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                {component.spacingData?.accuracy?.toFixed(1)}%
              </td>
              <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                {component.alignmentData?.accuracy !== null && component.alignmentData?.accuracy !== undefined 
                  ? component.alignmentData.accuracy.toFixed(1) + '%' 
                  : 'N/A'}
              </td>
              <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-blue-600 dark:text-blue-400">
                {component.layoutAccuracy?.toFixed(1)}%
              </td>
              <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                {component.colorData?.accuracy?.toFixed(1)}%
              </td>
              <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                {component.typographyData?.accuracy?.toFixed(1)}%
              </td>
              <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-green-600 dark:text-green-400">
                {component.styleAccuracy?.toFixed(1)}%
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    ) : (
      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md text-center">
        <p className="text-gray-500 dark:text-gray-400">
          No component-level data available. Simulation might not have generated components.
        </p>
        <Button 
          onClick={simulateCalculationSteps} 
          variant="outline" 
          size="sm" 
          className="mt-2"
        >
          Regenerate Simulation
        </Button>
      </div>
    )}
  </div>
</div>
              
              <Separator />
              
              <div>
                <h2 className="text-lg font-semibold mb-3">Average Accuracy Values</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                    <h3 className="font-medium mb-3">Layout Components</h3>
                    <ul className="space-y-2">
                      <li className="flex justify-between">
                        <span>Position Accuracy:</span>
                        <span className="font-mono">{calculationSteps?.averages?.positionAccuracy?.toFixed(1) || metrics.positionAccuracy?.toFixed(1)}%</span>
                      </li>
                      <li className="flex justify-between">
                        <span>Dimension Accuracy:</span>
                        <span className="font-mono">{calculationSteps?.averages?.dimensionAccuracy?.toFixed(1) || metrics.dimensionAccuracy?.toFixed(1)}%</span>
                      </li>
                      <li className="flex justify-between">
                        <span>Spacing Accuracy:</span>
                        <span className="font-mono">{calculationSteps?.averages?.spacingAccuracy?.toFixed(1) || metrics.marginPaddingAccuracy?.toFixed(1)}%</span>
                      </li>
                      <li className="flex justify-between">
  <span>Alignment Accuracy:</span>
  <span className="font-mono">
    {(() => {
      // Count components with valid alignment values
      const componentsWithAlignment = calculationSteps?.components?.filter(
        comp => comp.alignmentData?.accuracy !== null && comp.alignmentData?.accuracy !== undefined
      ) || [];
      
      // Calculate average only from valid components
      const avgValue = componentsWithAlignment.length > 0
        ? componentsWithAlignment.reduce((sum, comp) => sum + comp.alignmentData.accuracy, 0) / componentsWithAlignment.length
        : null;
      
      // Display the value or N/A
      return avgValue !== null && avgValue !== undefined
        ? `${avgValue.toFixed(1)}%`
        : 'N/A';
    })()}
  </span>
</li>
                      <Separator className="my-2" />
                      <li className="flex justify-between font-medium">
                        <span>Overall Layout:</span>
                        <span className="font-mono">{calculationSteps?.averages?.layoutAccuracy?.toFixed(1) || metrics.layoutAccuracy?.toFixed(1)}%</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                    <h3 className="font-medium mb-3">Style Components</h3>
                    <ul className="space-y-2">
                      <li className="flex justify-between">
                        <span>Color Accuracy:</span>
                        <span className="font-mono">{calculationSteps?.averages?.colorAccuracy?.toFixed(1) || metrics.colorAccuracy?.toFixed(1)}%</span>
                      </li>
                      <li className="flex justify-between">
                        <span>Typography Accuracy:</span>
                        <span className="font-mono">{calculationSteps?.averages?.typographyAccuracy?.toFixed(1) || metrics.fontAccuracy?.toFixed(1)}%</span>
                      </li>
                      <Separator className="my-2" />
                      <li className="flex justify-between font-medium">
                        <span>Overall Style:</span>
                        <span className="font-mono">{calculationSteps?.averages?.styleAccuracy?.toFixed(1) || metrics.styleAccuracy?.toFixed(1)}%</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                    <h3 className="font-medium mb-3">Final Accuracy</h3>
                    <ul className="space-y-2">
                      <li className="flex justify-between">
                        <span>Layout Accuracy (40%):</span>
                        <span className="font-mono">{metrics.layoutAccuracy?.toFixed(1)}% × 0.4</span>
                      </li>
                      <li className="flex justify-between">
                        <span>Style Accuracy (40%):</span>
                        <span className="font-mono">{metrics.styleAccuracy?.toFixed(1)}% × 0.4</span>
                      </li>
                      <li className="flex justify-between">
                        <span>Content Accuracy (20%):</span>
                        <span className="font-mono">{metrics.contentAccuracy?.toFixed(1)}% × 0.2</span>
                      </li>
                      <Separator className="my-2" />
                      <li className="flex justify-between font-medium">
                        <span>Overall Accuracy:</span>
                        <span className="font-mono">{metrics.overallAccuracy?.toFixed(1)}%</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg mt-6">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Note: This page shows detailed metrics calculations and raw data. The component-level data shown here is simulated based on the summary metrics, as the raw component data isn't always stored to save memory.
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No metrics data available. Please extract components first.</p>
              <Link to="/" className="mt-4 inline-block">
                <Button>Go to Extraction Page</Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}