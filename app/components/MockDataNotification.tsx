// app/components/MockDataNotification.tsx
import React from 'react';
import { AlertCircle, Info } from 'lucide-react';
import { Alert, AlertDescription } from '~/components/ui/alert';

interface MockDataNotificationProps {
  isVisible: boolean;
}

export const MockDataNotification: React.FC<MockDataNotificationProps> = ({ isVisible }) => {
  if (!isVisible) return null;

  return (
    <Alert className="mb-4 bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800">
      <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
      <AlertDescription className="text-amber-700 dark:text-amber-300">
        <div className="flex flex-col gap-1">
          <p>
            <strong>Note:</strong> You are viewing sample components in demo mode. 
          </p>
          <p className="text-sm text-amber-600 dark:text-amber-400">
            For full extraction capabilities, please run the app locally or on a server that supports browser automation.
          </p>
        </div>
      </AlertDescription>
    </Alert>
  );
};

// Alternative version with Info icon
export const DemoModeNotification: React.FC<MockDataNotificationProps> = ({ isVisible }) => {
  if (!isVisible) return null;

  return (
    <Alert className="mb-4 bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800">
      <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
      <AlertDescription className="text-blue-700 dark:text-blue-300">
        Running in demo mode with sample components. For full extraction features, run the app locally.
      </AlertDescription>
    </Alert>
  );
};