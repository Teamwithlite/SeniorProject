// app/components/SearchResultsBar.tsx
import React from 'react'

interface SearchResultsBarProps {
  totalResults: number
  extractionTime?: number
  searchQuery?: string
}

export const SearchResultsBar: React.FC<SearchResultsBarProps> = ({
  totalResults,
  extractionTime = 0,
  searchQuery = '',
}) => {
  return (
    <div className='w-full mb-4'>
      <div className='text-sm text-gray-600 dark:text-gray-400 pb-1'>
        About {totalResults.toLocaleString()} results
        {extractionTime > 0 && ` (${extractionTime.toFixed(2)} seconds)`}
        {searchQuery && <span> for "{searchQuery}"</span>}
      </div>
    </div>
  )
}
