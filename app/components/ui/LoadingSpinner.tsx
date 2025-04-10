// components/LoadingSpinner.tsx
import React from 'react'
import styles from './LoadingSpinner.module.css'

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large'
  color?: string
  message?: string
  progress?: number // Optional progress indicator (0-100)
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'medium',
  color = '#3b82f6',
  message = 'Extracting components...',
  progress,
}) => {
  const sizeClasses = {
    small: 'h-5 w-5',
    medium: 'h-8 w-8',
    large: 'h-12 w-12',
  }

  return (
    <div className={styles.spinnerContainer}>
      <div className='flex flex-col items-center justify-center gap-4'>
        <div
          className={`${styles.spinner} ${sizeClasses[size]}`}
          style={{
            borderColor: `${color} transparent transparent transparent`,
          }}
        />

        {message && (
          <p className='text-gray-600 dark:text-gray-300 text-center'>
            {message}
            {progress !== undefined && (
              <span className='ml-2 font-medium'>{Math.round(progress)}%</span>
            )}
          </p>
        )}

        {progress !== undefined && (
          <div className='w-48 bg-gray-200 rounded-full h-2.5 dark:bg-gray-700'>
            <div
              className='bg-blue-600 h-2.5 rounded-full'
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>
    </div>
  )
}
