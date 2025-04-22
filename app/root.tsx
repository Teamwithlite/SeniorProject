// app/root.tsx
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLocation,
  useRouteError,
  isRouteErrorResponse,
  Link,
} from '@remix-run/react'
import type { LinksFunction } from '@remix-run/node'
import { useState, useEffect } from 'react'
import { Sun, Moon } from 'lucide-react'
import { Button } from '~/components/ui/button'

import styles from './tailwind.css?url'

export const links: LinksFunction = () => [{ rel: 'stylesheet', href: styles }]

// Theme toggle button component
function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    // Get initial theme from localStorage or system preference
    const savedTheme = localStorage.getItem('theme')
    const prefersDark = window.matchMedia(
      '(prefers-color-scheme: dark)',
    ).matches

    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setTheme('dark')
      document.documentElement.classList.add('dark')
    } else {
      setTheme('light')
      document.documentElement.classList.remove('dark')
    }
  }, [])

  const toggleTheme = () => {
    if (theme === 'light') {
      setTheme('dark')
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      setTheme('light')
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }

  return (
    <button
      className={`fixed top-4 right-4 p-2 rounded-full z-50 transition-colors ${
        theme === 'light'
          ? 'bg-background border border-border text-foreground shadow-sm hover:bg-nyanza-600'
          : 'bg-night-300 border border-night-700 text-periwinkle-500 shadow-md hover:bg-night-400'
      }`}
      onClick={toggleTheme}
      aria-label={
        theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'
      }
    >
      {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
    </button>
  )
}

export function Layout({ children }: { children: React.ReactNode }) {
  // Check if we're on the root route or not
  const location = useLocation()
  const showThemeToggle = true // We'll show the toggle on all routes

  return (
    <html lang='en'>
      <head>
        <meta charSet='utf-8' />
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        <Meta />
        <Links />
      </head>
      <body className='bg-white dark:bg-gray-900'>
        {showThemeToggle && <ThemeToggle />}
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  )
}

export default function App() {
  return <Outlet />
}

// app/root.tsx or your error boundary component
export function ErrorBoundary() {
  const error = useRouteError()

  return (
    <div className='container mx-auto p-6'>
      <div className='bg-red-50 border border-red-200 p-4 rounded-md'>
        <h1 className='text-lg font-bold text-red-800'>Error</h1>
        <p className='text-red-700'>
          {isRouteErrorResponse(error)
            ? `${error.status} ${error.statusText}`
            : error instanceof Error
              ? error.message
              : 'Unknown error'}
        </p>
        <div className='mt-4'>
          <Link to='/'>
            <Button variant='outline' size='sm'>
              Return to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
