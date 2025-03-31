import React from 'react'
import { Loader2, Globe, Box, Eye, RefreshCw } from 'lucide-react'

type ExtractionPhase = 'navigating' | 'detecting' | 'extracting' | 'rendering'

interface ExtractionLoadingScreenProps {
  phase: ExtractionPhase
  progress: number
  currentUrl?: string
  detectedPatterns?: number
  extractedComponents?: Record<string, number>
}

const ExtractionLoadingScreen = ({
  phase = 'navigating',
  progress = 0,
  currentUrl = '',
  detectedPatterns = 0,
  extractedComponents = {},
}: ExtractionLoadingScreenProps) => {
  const phaseDetails = {
    navigating: {
      title: 'Navigating to website',
      icon: Globe,
      description: `Loading ${currentUrl || 'the website'}...`,
    },
    detecting: {
      title: 'Detecting patterns',
      icon: Box,
      description: `Found ${detectedPatterns} repeated component patterns`,
    },
    extracting: {
      title: 'Extracting components',
      icon: Eye,
      description:
        Object.entries(extractedComponents)
          .map(([type, count]) => `${type}: ${count}`)
          .join(', ') || 'Starting extraction...',
    },
    rendering: {
      title: 'Rendering previews',
      icon: RefreshCw,
      description: 'Preparing component previews...',
    },
  }

  const currentPhase = phaseDetails[phase] || phaseDetails.navigating

  return (
    <div className='flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6'>
      <div className='w-full max-w-md bg-white rounded-lg shadow-lg p-6'>
        <div className='text-center mb-6'>
          <h2 className='text-2xl font-bold text-gray-800'>
            {currentPhase.title}
          </h2>
          <p className='text-gray-600 mt-2'>{currentPhase.description}</p>
        </div>

        <div className='mb-6'>
          <div className='flex justify-between mb-1'>
            <span className='text-sm font-medium text-gray-700'>Progress</span>
            <span className='text-sm font-medium text-gray-700'>
              {Math.min(100, Math.max(0, progress))}%
            </span>
          </div>
          <div className='w-full bg-gray-200 rounded-full h-2.5'>
            <div
              className='bg-blue-600 h-2.5 rounded-full transition-all duration-300'
              style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            ></div>
          </div>
        </div>

        <div className='flex items-center justify-center'>
          <div
            className={`p-3 rounded-full ${
              phase === 'navigating'
                ? 'bg-blue-100 text-blue-600'
                : phase === 'detecting'
                  ? 'bg-purple-100 text-purple-600'
                  : phase === 'extracting'
                    ? 'bg-green-100 text-green-600'
                    : 'bg-yellow-100 text-yellow-600'
            }`}
          >
            {phase === 'navigating' ? (
              <Globe className='h-6 w-6 animate-pulse' />
            ) : phase === 'detecting' ? (
              <Box className='h-6 w-6 animate-pulse' />
            ) : phase === 'extracting' ? (
              <Eye className='h-6 w-6 animate-pulse' />
            ) : (
              <RefreshCw className='h-6 w-6 animate-spin' />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ExtractionLoadingScreen
