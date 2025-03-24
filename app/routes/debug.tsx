import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from '@remix-run/react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

export default function DebugPage() {
  const navigate = useNavigate()
  const [extractionData, setExtractionData] = useState(null)
  const [isPolling, setIsPolling] = useState(false)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [sessionId, setSessionId] = useState('')
  const [manualDebug, setManualDebug] = useState('')
  const [fetcher, setFetcher] = useState({ state: 'idle' })

  // Load extraction data and debug info from sessionStorage
  useEffect(() => {
    // In Remix, this will only run on the client
    if (typeof window !== 'undefined') {
      const savedData = sessionStorage.getItem('extractionData')
      const savedSessionId = sessionStorage.getItem('sessionId')
      const savedDebugLog = sessionStorage.getItem('debugLog')

      if (savedData) {
        setExtractionData(JSON.parse(savedData))
      }

      if (savedSessionId) {
        setSessionId(savedSessionId)
      }

      if (savedDebugLog) {
        setManualDebug(savedDebugLog)
      }
    }
  }, [])

  // Functions
  const startExtraction = () => {
    // Redirect to extraction page to restart
    navigate('/')
  }

  const checkStatus = () => {
    // Logic for checking extraction status
    // ...
    setManualDebug(
      (prev) =>
        prev + '\nManual status check triggered at ' + new Date().toISOString(),
    )
  }

  return (
    <div className='container mx-auto p-6'>
      <Card className='max-w-6xl mx-auto'>
        <CardHeader className='flex flex-row items-center justify-between'>
          <CardTitle>Debug Information</CardTitle>
          <Link to='/'>
            <Button variant='outline' size='sm'>
              <ArrowLeft className='mr-2 h-4 w-4' />
              Back to Extract
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          <div className='mt-4'>
            <div className='rounded bg-black text-white p-4 text-xs font-mono h-64 overflow-auto'>
              <div>Fetcher State: {fetcher.state}</div>
              <div>Session ID: {sessionId || 'none'}</div>
              <div>Is Polling: {isPolling ? 'yes' : 'no'}</div>
              <div>Extraction Status: {extractionData?.status || 'none'}</div>
              <div>Progress: {extractionData?.progress || 0}%</div>
              <div>
                Components Found: {extractionData?.componentsFound || 0}
              </div>
              <div>
                Components in Current Data:{' '}
                {extractionData?.components?.length || 0}
              </div>
              <div>Elapsed Time: {elapsedTime}s</div>
              <div className='mt-4 pt-4 border-t border-gray-700'>
                Debug Log:
              </div>
              <pre className='whitespace-pre-wrap'>{manualDebug}</pre>
            </div>
            <div className='mt-4 flex gap-2'>
              <Button onClick={startExtraction} variant='outline' size='sm'>
                Restart Extraction
              </Button>
              <Button onClick={checkStatus} variant='outline' size='sm'>
                Check Status Manually
              </Button>
              <Button
                onClick={() => window.location.reload()}
                variant='outline'
                size='sm'
              >
                Refresh Page
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
