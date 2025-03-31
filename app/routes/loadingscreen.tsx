import React, { useState, useEffect } from 'react'
import { Loader2, Globe, Box, Eye } from 'lucide-react'

const ExtractionLoadingScreen = () => {
  const [currentStep, setCurrentStep] = useState(0)
  const [progress, setProgress] = useState(0)

  const steps = [
    { name: 'Navigating to website', icon: Globe, duration: 5000 },
    { name: 'Extracting components', icon: Box, duration: 8000 },
    { name: 'Loading preview', icon: Eye, duration: 3000 },
  ]

  // Simulate the extraction process
  useEffect(() => {
    let timer
    let progressTimer

    const startStep = (stepIndex) => {
      if (stepIndex >= steps.length) {
        clearInterval(progressTimer)
        return
      }

      setCurrentStep(stepIndex)
      setProgress(0)

      // Progress animation
      const stepDuration = steps[stepIndex].duration
      const interval = 50
      const increments = stepDuration / interval
      let currentProgress = 0

      progressTimer = setInterval(() => {
        currentProgress += 100 / increments
        setProgress(Math.min(Math.round(currentProgress), 100))

        if (currentProgress >= 100) {
          clearInterval(progressTimer)
          // Move to next step
          timer = setTimeout(() => startStep(stepIndex + 1), 500)
        }
      }, interval)
    }

    // Start the extraction simulation
    startStep(0)

    return () => {
      clearTimeout(timer)
      clearInterval(progressTimer)
    }
  }, [])

  const calculateTotalProgress = () => {
    const totalSteps = steps.length
    const completedSteps = currentStep
    const currentStepProgress = progress / 100

    return Math.round(
      ((completedSteps + currentStepProgress) / totalSteps) * 100,
    )
  }

  return (
    <div className='flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6'>
      <div className='w-full max-w-md bg-white rounded-lg shadow-lg p-6'>
        <div className='text-center mb-6'>
          <h2 className='text-2xl font-bold text-gray-800'>
            Extracting Website Components
          </h2>
          <p className='text-gray-600'>
            Please wait while we process your request
          </p>
        </div>

        {/* Total progress bar */}
        <div className='mb-8'>
          <div className='flex justify-between mb-1'>
            <span className='text-sm font-medium text-gray-700'>
              Overall Progress
            </span>
            <span className='text-sm font-medium text-gray-700'>
              {calculateTotalProgress()}%
            </span>
          </div>
          <div className='w-full bg-gray-200 rounded-full h-2.5'>
            <div
              className='bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-out'
              style={{ width: `${calculateTotalProgress()}%` }}
            ></div>
          </div>
        </div>

        {/* Steps */}
        <div className='space-y-6'>
          {steps.map((step, index) => {
            const StepIcon = step.icon
            const isActive = index === currentStep
            const isCompleted = index < currentStep

            return (
              <div key={index} className='flex items-center'>
                <div
                  className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                    isCompleted
                      ? 'bg-green-100 text-green-600'
                      : isActive
                        ? 'bg-blue-100 text-blue-600'
                        : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  {isActive ? (
                    <Loader2 className='h-5 w-5 animate-spin' />
                  ) : (
                    <StepIcon className='h-5 w-5' />
                  )}
                </div>

                <div className='ml-4 flex-1'>
                  <h3
                    className={`text-sm font-medium ${
                      isCompleted
                        ? 'text-green-600'
                        : isActive
                          ? 'text-blue-600'
                          : 'text-gray-500'
                    }`}
                  >
                    {step.name}
                  </h3>

                  {isActive && (
                    <div className='mt-2'>
                      <div className='w-full bg-gray-200 rounded-full h-1.5'>
                        <div
                          className='bg-blue-600 h-1.5 rounded-full transition-all duration-300 ease-out'
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>

                {isCompleted && (
                  <span className='flex-shrink-0 ml-2 text-green-600'>
                    <svg
                      className='w-5 h-5'
                      fill='currentColor'
                      viewBox='0 0 20 20'
                    >
                      <path
                        fillRule='evenodd'
                        d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                        clipRule='evenodd'
                      />
                    </svg>
                  </span>
                )}
              </div>
            )
          })}
        </div>

        {/* Extraction details */}
        <div className='mt-8 pt-6 border-t border-gray-200'>
          <div className='text-sm text-gray-500 space-y-2'>
            {currentStep === 0 && (
              <p>
                Connecting to the website and preparing to scan the page
                structure...
              </p>
            )}
            {currentStep === 1 && (
              <p>
                Identifying UI patterns, taking component screenshots, and
                preserving styles...
              </p>
            )}
            {currentStep === 2 && (
              <p>
                Processing extracted components and preparing the preview
                display...
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Cancel button */}
      <button className='mt-6 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'>
        Cancel Extraction
      </button>
    </div>
  )
}

export default ExtractionLoadingScreen
