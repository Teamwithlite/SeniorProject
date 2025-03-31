// app/components/LoadingScreen.tsx
import React, { useState, useEffect } from 'react'
import { Loader2 } from 'lucide-react'

interface LoadingScreenProps {
  message: string
  progress?: number
  details?: string
  elapsedTime?: number
  terminalReady?: boolean
}

export function LoadingScreen({
  message,
  progress = 0,
  details = '',
  elapsedTime = 0,
  terminalReady = false,
}: LoadingScreenProps) {
  // State to track if we should show the "waiting for terminal" message
  const [showTerminalMessage, setShowTerminalMessage] = useState(false)
  
  // If progress is 100% but terminal isn't ready yet, show a message after a delay
  useEffect(() => {
    let timer: NodeJS.Timeout | undefined
    
    if (progress === 100 && !terminalReady) {
      timer = setTimeout(() => {
        setShowTerminalMessage(true)
      }, 2000) // Show message after 2 seconds of being at 100%
    }
    
    return () => {
      if (timer) clearTimeout(timer)
    }
  }, [progress, terminalReady])

  // Determine which phase we're in based on progress
  const isExtractionPhase = progress < 70
  const isPreviewPhase = progress >= 70 && progress < 100
  const isTerminalPhase = progress === 100 && !terminalReady

  // Calculate phase-specific progress
  const extractionProgress = isExtractionPhase
    ? Math.min(100, (progress / 70) * 100)
    : 100

  const previewProgress = isPreviewPhase
    ? Math.min(100, ((progress - 70) / 30) * 100)
    : progress === 100
      ? 100
      : 0

  return (
    <div className='fixed inset-0 flex items-center justify-center bg-white bg-opacity-90 dark:bg-night-900 dark:bg-opacity-90 z-50'>
      <div className='text-center max-w-md w-full p-6 bg-white dark:bg-night-800 rounded-lg shadow-2xl'>
        <div className='mb-6'>
          <Loader2 className='mx-auto h-12 w-12 text-blue-600 dark:text-periwinkle-400 animate-spin' />
        </div>

        <h2 className='text-xl font-semibold mb-4 dark:text-gray-200'>
          {isTerminalPhase && showTerminalMessage 
            ? 'Waiting for terminal output to complete...'
            : message}
        </h2>

        {/* Phase Indicators */}
        <div className='grid grid-cols-3 gap-2 mb-3'>
          <div className='text-center'>
            <div
              className={`text-xs font-medium mb-1 ${isExtractionPhase ? 'text-blue-600 dark:text-periwinkle-400' : 'text-gray-400 dark:text-gray-500'}`}
            >
              <div className='flex items-center justify-center gap-1'>
                {isExtractionPhase && (
                  <span className='flex h-2 w-2 relative'>
                    <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75'></span>
                    <span className='relative inline-flex rounded-full h-2 w-2 bg-blue-600'></span>
                  </span>
                )}
                Extraction
              </div>
            </div>
            <div className='w-full bg-gray-200 dark:bg-night-600 rounded-full h-2 overflow-hidden'>
              <div
                className={`${isExtractionPhase ? 'bg-blue-600 dark:bg-periwinkle-400' : 'bg-green-500'} h-2 rounded-full transition-all duration-300`}
                style={{ width: `${extractionProgress}%` }}
              />
            </div>
          </div>
          <div className='text-center'>
            <div
              className={`text-xs font-medium mb-1 ${isPreviewPhase ? 'text-blue-600 dark:text-periwinkle-400' : previewProgress === 100 ? 'text-green-500' : 'text-gray-400 dark:text-gray-500'}`}
            >
              <div className='flex items-center justify-center gap-1'>
                {isPreviewPhase && (
                  <span className='flex h-2 w-2 relative'>
                    <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75'></span>
                    <span className='relative inline-flex rounded-full h-2 w-2 bg-blue-600'></span>
                  </span>
                )}
                Preview Generation
              </div>
            </div>
            <div className='w-full bg-gray-200 dark:bg-night-600 rounded-full h-2 overflow-hidden'>
              <div
                className={`${isPreviewPhase ? 'bg-blue-600 dark:bg-periwinkle-400' : previewProgress === 100 ? 'bg-green-500' : 'bg-gray-300 dark:bg-night-500'} h-2 rounded-full transition-all duration-300`}
                style={{ width: `${previewProgress}%` }}
              />
            </div>
          </div>
          <div className='text-center'>
            <div
              className={`text-xs font-medium mb-1 ${isTerminalPhase ? 'text-blue-600 dark:text-periwinkle-400' : terminalReady ? 'text-green-500' : 'text-gray-400 dark:text-gray-500'}`}
            >
              <div className='flex items-center justify-center gap-1'>
                {isTerminalPhase && (
                  <span className='flex h-2 w-2 relative'>
                    <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75'></span>
                    <span className='relative inline-flex rounded-full h-2 w-2 bg-blue-600'></span>
                  </span>
                )}
                Terminal Output
              </div>
            </div>
            <div className='w-full bg-gray-200 dark:bg-night-600 rounded-full h-2 overflow-hidden'>
              <div
                className={`${isTerminalPhase ? 'bg-blue-600 dark:bg-periwinkle-400' : terminalReady ? 'bg-green-500' : 'bg-gray-300 dark:bg-night-500'} h-2 rounded-full transition-all duration-300`}
                style={{ width: `${terminalReady ? 100 : isTerminalPhase ? 50 : 0}%` }}
              />
            </div>
          </div>
        </div>

        {/* Overall Progress Bar */}
        <div className='w-full bg-gray-200 dark:bg-night-600 rounded-full h-2.5 mb-4 overflow-hidden'>
          <div
            className='bg-blue-600 dark:bg-periwinkle-400 h-2.5 rounded-full transition-all duration-300'
            style={{ width: `${terminalReady ? 100 : progress}%` }}
          />
        </div>

        <div className='text-sm text-gray-600 dark:text-gray-400 mb-2'>
          {terminalReady ? '100' : progress}% Complete
          {elapsedTime > 0 && ` (${elapsedTime}s)`}
        </div>

        {details && (
          <p className='text-xs text-gray-500 dark:text-gray-300 italic'>
            {details}
          </p>
        )}

        {showTerminalMessage && isTerminalPhase && (
          <div className='mt-2 text-amber-500 dark:text-amber-400 text-sm animate-pulse'>
            Waiting for terminal to complete extraction...
          </div>
        )}

        {elapsedTime > 30 && (
          <div className='mt-4 text-yellow-600 dark:text-yellow-400 text-xs'>
            Extraction is taking longer than expected...
          </div>
        )}
      </div>
    </div>
  )
}